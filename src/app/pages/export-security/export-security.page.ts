import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { ClipboardService } from '../../services/clipboard.service';
import { AccountStored } from '../../models/account-stored';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-export-security',
  templateUrl: './export-security.page.html',
  styleUrls: ['./export-security.page.scss'],
})
export class ExportSecurityPage implements OnInit {
  pw = "";
  title = "Secret Recovery Phrase";
  introduction = " If you ever change browsers or move computers, you will need this Secret Recovery Phrase to access your accounts. Save them somewhere safe and secret.";
  warning = "DO NOT share this phrase with anyone! These words can be used to steal all your accounts.";
  label = "Enter password to continue";
  account = new AccountStored();
  mnemonic = "";
  isConfirmed = false;
  isNotConfirmed = true;

  constructor(
    private router:Router,
    private route:ActivatedRoute,
    private modalCtrl: ModalController,
    private storageService: StorageService,
    private clipboard:ClipboardService,
    public toastController: ToastController,) { }

  ngOnInit() {
    const routerState = this.router.getCurrentNavigation().extras.state;
    this.account.addr = routerState.account.account.addr;
    this.account.name = routerState.account.account.name;
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async confirm() {
    var isCorrectPw = await this.storageService.getHashedDecryption("keyForUser",this.pw);
    if(isCorrectPw){
      this.storageService.getDecryption("accounts",null).then(async(response)=>{
        var responseToAny:any = response;  
        this.mnemonic = await this.getAccountListFromStorage(responseToAny);
        this.isConfirmed = true;
        this.isNotConfirmed = false;
      });
    }
  }

  async copy(){
    var isCopied = await this.clipboard.copyString(this.mnemonic);
    if(isCopied){
      this.presentToastWithOptions();
    }
  }


  async presentToastWithOptions() {
    const toast = await this.toastController.create({
      message: "Successfully Copied",
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

  goToWalletPage(){
    const navigationExtras: NavigationExtras = {
      state: {
        account:this.account,
      },
    };
    this.router.navigateByUrl('/wallet',navigationExtras);
  }

  getAccountListFromStorage = (responseToAny): Promise<string> =>{
    return new Promise<string>((resolve, reject)=>{
      var getAccount = responseToAny.find(account => account.addr === this.account.addr);
      var mnemonic:string = getAccount.mnemonic;
      return resolve(mnemonic);
    })
  }

}
