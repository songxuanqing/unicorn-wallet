import { Component, OnInit,  } from '@angular/core';
import { Account } from '../../models/account';
import { Token } from '../../models/token';
import { Blockchain2Service } from '../../services/blockchain2.service';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { HeaderService } from '../../services/header.service';

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
  test_token_id = 94434081;
  //test_account='5QX5D4HPXQIQ3ODMGN6NTH6GO435N5GJSA72FBKSJI4WCAJ5VAXWTAF6UU';
  constructor(
    private header:HeaderService,
    public apiService: Blockchain2Service,
    private router:Router,
    private route:ActivatedRoute,
    public toastController: ToastController,
  ) {
    this.account = new Account();
  }
  ngOnInit() {
    const routerState = this.router.getCurrentNavigation().extras.state;
    this.account.address = routerState.account.addr;
    this.account.name = routerState.account.name;
    this.getAccountInfo(this.account.address);
    this.apiService.getTxnParam().then((response) =>
      {
       console.log("txnParam",response)
      })
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


  getAccountInfo(account_address) {
    this.apiService.getAccountInfo(account_address).then(async (response) => {
      var accountData:any = response;
      console.log(accountData.assets);
      this.account.address = accountData.address;
      this.account.amount = accountData.amount;
      accountData.assets.forEach(async (item)=>{
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
      });
      console.log(this.assetInfo);
      this.account.assets = this.assetInfo;
      console.log(this.account);
      return this.account;
    });
  }
  
  getAssetInfo(tk, asset_id){
    return this.apiService.getAssetInfo(asset_id).then((response) =>
      {
        var tokenData: any = response;
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
}