import { Component, OnInit,  } from '@angular/core';
import { Account } from '../../models/account';
import { Token } from '../../models/token';
import { Blockchain2Service } from '../../services/blockchain2.service';
import { Blockchain3Service } from '../../services/blockchain3.service';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { HeaderService } from '../../services/header.service';
import { BuyService } from '../../services/buy.service';
import { PriceService } from '../../services/price.service';
import { StorageService } from '../../services/storage.service';
import getSymbolFromCurrency from 'currency-symbol-map';
import { Currency } from '../../const/currency';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {
  public account:Account;
  public assetInfo:Array<any> = [];
  public tokenInfo:Array<any> = [];
  public NFTInfo:Array<any> = [];
  public token_unit:string = "";
  public isBackFromTxn:boolean = false;
  public buyUrlList:Array<any> = [];
  public balanceToCurrency:number;
  public balanceToCurrencyToString:string;
  public isTokenHoldings:boolean = true; //토큰보유여부, 보유할 경우(true), hidden된다.(hidden=true)
  public isNFTHoldings:boolean = true;// NFT보유여부, 보유할 경우(true), hidden된다.(hidden=true)
  
  currency = 'USD'; //test currency, 이후 setting 값에서 가져올 예정.
  symbol = '$';
  test_token_id = 94434081;
  //test_account='5QX5D4HPXQIQ3ODMGN6NTH6GO435N5GJSA72FBKSJI4WCAJ5VAXWTAF6UU';
  constructor(
    private header:HeaderService,
    public apiService: Blockchain2Service,
    public blockchainSDKService: Blockchain3Service,
    private router:Router,
    private route:ActivatedRoute,
    public toastController: ToastController,
    private buyService:BuyService,
    private priceService:PriceService,
    private storageService:StorageService,
  ) {
    this.account = new Account();
  }
  ngOnInit() {
    const routerState = this.router.getCurrentNavigation().extras.state;
    this.account.address = routerState.account.addr;
    this.account.name = routerState.account.name;
    this.getAccountInfo(this.account.address);
    this.createBuyUrls();
  }

  openMenu() {
    this.header.openMenu();
  }

  ionViewDidEnter(){
    console.log(history.state);
    if(history.state!=undefined){
      this.isBackFromTxn = history.state.txnParams.done;
      if(this.isBackFromTxn){
        this.presentToastWithOptions();
      }
    }
  }

  goToSendPage(){
    const navigationExtras: NavigationExtras = {
      state: {
        txnParams:{
          sender: this.account.address,
        },
      },
    };
    this.router.navigateByUrl('/send',navigationExtras);
  }

  
  sendToken(asset_id,asset_unit){
    const navigationExtras: NavigationExtras = {
      state: {
        txnParams:{
          token_id: asset_id,
          sender: this.account.address,
          token_unit : asset_unit,
        },
      },
    };
    this.router.navigateByUrl('/send',navigationExtras);
  }


  goToHistoryPage(){
    const navigationExtras: NavigationExtras = {
      state: {
        txnParams:{
          sender: this.account.address,
        },
      },
    };
    this.router.navigateByUrl('/history',navigationExtras);
  }


  async getAccountInfo(account_address) {
    //rest api 서비스의 변수들 먼저 생성.
    await this.apiService.setNetworkVariables();
    await this.blockchainSDKService.setNetworkVariables();
    this.apiService.getAccountInfo(account_address).then(async (response) => {
      var accountData:any = response;
      accountData = accountData.account;
      this.account.address = accountData.address;
      this.account.amount = accountData.amount;
      for(var i=0; i<accountData.assets.length; i++){
        var item = accountData.assets[i];
        var token = new Token();
        token.amount = item.amount;
        token['asset-id'] = item['asset-id'];
        token['is-frozen'] = item['is-frozen'];
        token = await this.getAssetInfo(token,item['asset-id']);
        this.assetInfo.push(token);
        if(token.amount>1){
          this.tokenInfo.push(token);
        }else if(token.amount==1){
          if(token.url.includes('ipfs://')){
            token = await this.getNFTImage(token);
          }
          this.NFTInfo.push(token);
        }
      }
      console.log(this.assetInfo);
      this.account.assets = this.assetInfo;
      console.log(this.account);
      //만약 tokenInfo 또는 NFTInfo배열이 길이가 0이면, 보유한 토큰/NFT가 없습니다 메세지 표시용
      //accountData.assets 을 forEach 함수의 콜백이 비동기 함수일 경우, 
      //정확한 length값을 받을수 없어 for...of문으로 코딩
      if(this.tokenInfo.length>0){ 
        this.isTokenHoldings = true;
      }else{
        this.isTokenHoldings = false;
      }
      if(this.NFTInfo.length>0){
        this.isNFTHoldings = true;
      }else{
        this.isNFTHoldings = false;
      }

      //저장소에서 사용자 지정 통화를 가져온다.
      await this.getSelectedCurrency();
      //주어진 통화기준 알고랜드 단가 가져와서 현재 가지고 있는 알고량에 곱하기
      //전체 알고를 주어진 통화로 치환.
      var unitPrice = await this.getUnitPriceWithCurrency(this.currency);
      this.balanceToCurrency = this.account.amount * +unitPrice;
      this.balanceToCurrency = Math.round(this.balanceToCurrency);
      this.balanceToCurrencyToString = this.balanceToCurrency.toString()
      .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","); //천단위 표시
      return this.account;
    });
  }
  
  getAssetInfo(tk, asset_id){
    return this.apiService.getAssetInfo(asset_id).then((response) =>
      {
        var tokenData: any = response;
        tokenData = tokenData.asset;
        tk.name = tokenData.params.name;
        tk.url = tokenData.params.url;
        tk['unit-name'] = tokenData.params['unit-name'];
        return tk;
      })
  }

  getNFTImage(tk){
    return this.apiService.getNFTMetaData(tk.url).then((response) =>
      {
        var res:any = response;
        var imageUrl = res.image;
        var stringArr = imageUrl.split(':');
        var imagePath = stringArr[1].substring(1);
        tk.imageUrl = 'https://ipfs.io/ipfs' + imagePath
        return tk;
      })
  }

  async presentToastWithOptions() {
    const toast = await this.toastController.create({
      message: "Transaction Successfully Requested",
      duration: 500,
      icon: 'information-circle',
      position: 'top',
      buttons: [
         {
          text: 'DONE',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    await toast.present();
    const { role } = await toast.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }
  
  //buy modal
  createBuyUrls(){
    this.buyService.imgUrls.forEach(async item=>{
      var url:any;
      if(item.marketName=="wyre"){
        url = await this.buyService.createWyreUrl(this.account.address);
      }
      var market = {
        marketName:item.marketName,
        imgUrl:item.imgUrl,
        url:url,
      }
      this.buyUrlList.push(market);
    })
  }

  //주어진 통화기준 알고랜드 단가 가져오기
  getUnitPriceWithCurrency(currency){
    return new Promise(resolve=>{
      this.priceService.getUnitPriceWithCurrency(currency).then(response=>{
        var responseToAny:any = response;
        var unitPrice = +responseToAny.coin.price;
        return resolve(unitPrice);
      });
    });
  }

   //db에서 과거에 선택했던 통화 가져오기
   getSelectedCurrency(){
    return new Promise(resolve=>{
        this.storageService.get("currency").then(response=>{
          var responseJson = JSON.parse(response);
          if(Object.keys(responseJson).length > 0){
            this.currency = responseJson.currency;
            this.symbol = responseJson.symbol;
            return resolve(true);
          }else{
            //만약 최초 사용자여서 currency 저장 기록이 없다면
            //USD를 default로 생성해서 저장 후 다시 불러온다.
            var currencyClass = new Currency();
            var currencySelected = currencyClass.USD;
            var currency = 'USD';
            var symbol = getSymbolFromCurrency(currency);
            var currencyValue = {currencyWithDescription:currencySelected, currency:currency, symbol:symbol};
            var currencyValueToString = JSON.stringify(currencyValue); //스트링변환해서 저장
            this.storageService.set("currency",currencyValueToString);
            this.storageService.get("currency").then(response=>{
              var responseJson = JSON.parse(response);
              this.currency = responseJson.currency;
              this.symbol = responseJson.symbol;
              return resolve(false);
            });
          }
        });
    })
  }


}