import { Component, OnInit, ViewChild } from '@angular/core';
import { Blockchain3Service } from '../../services/blockchain3.service';
import { StorageService } from '../../services/storage.service';
import { AccountStored } from '../../models/account-stored';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { IonModal,ToastController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';

@Component({
  selector: 'app-import-or-create',
  templateUrl: './import-or-create.page.html',
  styleUrls: ['./import-or-create.page.scss'],
})
export class ImportOrCreatePage implements OnInit {
  @ViewChild(IonModal) modal: IonModal;

  handlerMessage = "";
  importedMnemonic: string;
  inputMnemonic: string;
  public accountList:Array<AccountStored> = [];
  public account:AccountStored;

  constructor(private router:Router,
    private route:ActivatedRoute,
    private blockchainSDKService: Blockchain3Service,
    private storageService: StorageService,
    public toastController: ToastController,) { }

  ngOnInit() {

  }

  async importAndGoToWallet(inputMnemonic){
    var isConfirmed = await this.confirm(inputMnemonic);
    console.log("isConfirmed",isConfirmed);
    if(isConfirmed){
      const navigationExtras: NavigationExtras = {
        state: {
          isLogin:true,
          account:this.account,
        },
      };
      console.log(navigationExtras);
      this.router.navigateByUrl('/wallet',navigationExtras);
    }
  }

  
  async createAndGoToWallet(){
    await this.createAccount();
    const navigationExtras: NavigationExtras = {
      state: {
        isLogin:true,
        account:this.account,
      },
    };
    this.router.navigateByUrl('/wallet',navigationExtras);
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm(inputMnemonic) {
    return new Promise(async (resolve)=>{
      this.blockchainSDKService.importAccount(inputMnemonic).then(async(response)=>{
        console.log(response);
        var responseToArray:any = response;
        var result:boolean = response[0];
        var address:string = response[1];
        if(result){
          await this.modal.dismiss([address,inputMnemonic], 'confirm');
          return resolve(true);
        }else{
          this.handleToastController("There is no account of the mnemonic. Please check again.");
        }
      }).catch((reject)=>{
        this.handleToastController(reject); 
      });
    })
  }
  
  async handleToastController(message){
    const toast = await this.toastController.create({
      message: message,
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
  };

  onWillDismiss(event: Event) {
    return new Promise(async (resolve)=>{
      const ev = event as CustomEvent<OverlayEventDetail<string>>;
      if (ev.detail.role === 'confirm') {
        var name = "Account"+(this.accountList.length + 1);
        var newAccount:AccountStored = new AccountStored();
        newAccount.isMain = true;
        newAccount.name = name;
        newAccount.addr = ev.detail.data[0];
        newAccount.mnemonic = ev.detail.data[1];
        this.accountList.push(newAccount);
        await this.storeAccount();
        newAccount.mnemonic = "";
        this.account = newAccount;
        console.log(this.accountList);
        return resolve(true);
        }else{
  
      }
    })


  }
  
  createAccount(){
    return new Promise(resolve=>{
      this.blockchainSDKService.createAccount().then(async(response)=>{
        console.log(response);
        var responseToString:any = response;
        var name = "Account"+(this.accountList.length + 1);
        var responseArr = responseToString.split(":");
        var newAccount:AccountStored = new AccountStored();
        newAccount.isMain = true;
        newAccount.name = name;
        newAccount.addr = responseArr[0];
        newAccount.mnemonic = responseArr[1];
        this.accountList.push(newAccount);
        await this.storeAccount();
        newAccount.mnemonic = "";
        this.account = newAccount;
        return resolve(true);
      });
    })
  }

  async storeAccount(){
    await this.storageService.setEncryption("accounts",this.accountList, null);
  }

}
