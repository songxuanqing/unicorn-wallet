import { Component, OnInit,  } from '@angular/core';
import { Account } from '../../models/account';
import { Token } from '../../models/token';
import { ApiService } from '../../services/blockchain.service';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';


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
  test_account='5QX5D4HPXQIQ3ODMGN6NTH6GO435N5GJSA72FBKSJI4WCAJ5VAXWTAF6UU';
  constructor(
    public apiService: ApiService,
    private router:Router,
    private route:ActivatedRoute,
    public toastController: ToastController
  ) {
    this.account = new Account();
  }
  ngOnInit() {
    const routerState = this.router.getCurrentNavigation().extras.state;
    this.getAccountInfo(this.test_account);
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
          token_id: this.test_token_id,
          sender: this.test_account,
          token_unit : this.token_unit,
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
          sender: this.test_account,
          token_unit : asset_unit,
        },
      },
    };
    this.router.navigateByUrl('/send',navigationExtras);
  }


  getAccountInfo(account_address) {
    this.apiService.getAccountInfo(account_address).then(async (response) => {
      console.log(response);
      var accountData = response;
      this.account.address = accountData.address;
      this.account.amount = accountData.amount;
      for(var i = 0; i < accountData.assets.length; i++){
        var token = new Token();
        token.amount = accountData.assets[i].amount;
        token['asset-id'] = accountData.assets[i]['asset-id'];
        token['is-frozen'] = accountData.assets[i]['is-frozen'];
        token = await this.getAssetInfo(token,accountData.assets[i]['asset-id']);
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
      return this.account;
    });
  }
  
  getAssetInfo(tk, asset_id){
    return this.apiService.getAssetInfo(asset_id).then((response) =>
      {
        var tokenData: any;
        tokenData = response;
        console.log(tokenData.params.name);
        tk.name = tokenData.params.name;
        tk.url = tokenData.params.url;
        tk['unit-name'] = tokenData.params['unit-name'];
        return tk;
      })
  }

  getNFTImage(tk){
    return this.apiService.getNFTMetaData(tk.url).then((response) =>
      {
        var imageUrl = response.image;
        var stringArr = imageUrl.split(':');
        var imagePath = stringArr[1].substring(1);
        tk.imageUrl = 'https://ipfs.io/ipfs' + imagePath
        return tk;
      })
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Your settings have been saved.',
      duration: 2000
    });
    toast.present();
  }

  async presentToastWithOptions() {
    const toast = await this.toastController.create({
      message: "Transaction Successfully Requested",
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
