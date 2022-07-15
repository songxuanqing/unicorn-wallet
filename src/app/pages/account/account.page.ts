import { Component, OnInit, ViewChild  } from '@angular/core';
import { Blockchain2Service } from '../../services/blockchain2.service';
import { Blockchain3Service } from '../../services/blockchain3.service';
import { StorageService } from '../../services/storage.service';
import { AccountStored } from '../../models/account-stored';
import { AccountWithAmount } from '../../models/account-with-amount';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { IonModal,ToastController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})

export class AccountPage implements OnInit {
  @ViewChild(IonModal) modal: IonModal;

  importedMnemonic: string;
  inputMnemonic: string;
  
  public accountList:Array<AccountStored> = [];
  public accountListWithAmount:Array<AccountWithAmount> = [];
  test_account:AccountStored = {
    name: "Account1",
    addr: null,
    mnemonic: null,
  }
  test_account_with_amount:AccountWithAmount = {
    amount: 0,
    account: this.test_account,
  }
  constructor( private router:Router,
    private route:ActivatedRoute,
    private apiService: Blockchain2Service,
    private blockchainSDKService: Blockchain3Service,
    private storageService: StorageService,
    public toastController: ToastController,) { 

    }

  ngOnInit() {

  }
  ionViewWillEnter(){
    this.getAccountList();
    //this.getDevAccount();
  }

  createAccount(){
    this.blockchainSDKService.createAccount().then(async(response)=>{
      console.log(response);
      var responseToString:any = response;
      var name = "Account"+(this.accountList.length + 1);
      var responseArr = responseToString.split(":");
      var newAccount:AccountStored = new AccountStored();
      newAccount.name = name;
      newAccount.addr = responseArr[0];
      newAccount.mnemonic = responseArr[1];
      this.accountList.push(newAccount);
      var newAccountWithAmount:AccountWithAmount = new AccountWithAmount();
      newAccountWithAmount.account = newAccount;
      newAccountWithAmount.amount = 0;
      this.accountListWithAmount.push(newAccountWithAmount);
      console.log(this.accountList);
      this.storeAccount();
    });
  }

  async storeAccount(){
    await this.storageService.setEncryption("accounts",this.accountList, null);
  }

  getAccountList(){
    this.storageService.getDecryption("accounts",null).then(async(response)=>{
      var responseToAny:any = response;
      this.getAccountListFromStorage(responseToAny).then(async(response)=>{
        this.getAmountByAccount();
      })
    });
  }

  getAccountListFromStorage(responseToAny){
    return new Promise((resolve)=>{
      for(var i = 0; i<responseToAny.length; i++){
        var accountStored:AccountStored = {
         name:"",
         addr:"",
         mnemonic:"",
        };
       type Temp = {
         [key:string]: any
       }
       var temp:Temp = responseToAny[i];
       accountStored.name = temp.name;
       accountStored.addr = temp.addr;
       accountStored.mnemonic = temp.mnemonic;
       this.accountList.push(accountStored);
       var account_with_amount:AccountWithAmount = {
         amount:0,
         account:accountStored,
        };
       this.accountListWithAmount.push(account_with_amount);
     }
     return resolve("done");
    })
  }

  getDevAccount(){
    this.test_account.addr = "5QX5D4HPXQIQ3ODMGN6NTH6GO435N5GJSA72FBKSJI4WCAJ5VAXWTAF6UU";
    this.test_account.mnemonic = "above luxury grocery barely obtain recipe record need card invest gold exclude market huge frozen wheat nation deal same option burst slam section about stone";
    this.accountList.push(this.test_account);
    this.accountListWithAmount.push(this.test_account_with_amount);
    this.getAmountByAccount();
    this.storeAccount();
    this.getAccountList();
  }

  async getAmountByAccount(){
    for (var item of this.accountListWithAmount){
      var response = await this.apiService.getAccountInfo(item.account.addr)
      var accountData:any = response;
      var accountAmount:number = accountData.amount;
      item.amount = accountAmount;
    }
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm(inputMnemonic) {
    this.blockchainSDKService.importAccount(inputMnemonic).then(async(response)=>{
      console.log(response);
      var responseToArray:any = response;
      var result:boolean = response[0];
      var address:string = response[1];
      if(result){
        this.modal.dismiss([address,inputMnemonic], 'confirm');
      }else{
        this.handleToastController("There is no account of the mnemonic. Please check again.");
      }
    }).catch((reject)=>{
      this.handleToastController(reject); 
    });
  }
  
  async handleToastController(message){
    const toast = await this.toastController.create({
      message: message,
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
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      var name = "Account"+(this.accountList.length + 1);
      var newAccount:AccountStored = new AccountStored();
      newAccount.name = name;
      newAccount.addr = ev.detail.data[0];
      newAccount.mnemonic = ev.detail.data[1];
      this.accountList.push(newAccount);
      var newAccountWithAmount:AccountWithAmount = new AccountWithAmount();
      newAccountWithAmount.account = newAccount;
      newAccountWithAmount.amount = 0;
      this.accountListWithAmount.push(newAccountWithAmount);
      console.log(this.accountList);
      this.storeAccount();
      }else{

    }
  }


}
