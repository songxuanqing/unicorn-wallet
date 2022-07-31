import { Component, OnInit, ViewChild  } from '@angular/core';
import { HeaderService } from '../../services/header.service';
import { Blockchain2Service } from '../../services/blockchain2.service';
import { Blockchain3Service } from '../../services/blockchain3.service';
import { StorageService } from '../../services/storage.service';
import { AccountStored } from '../../models/account-stored';
import { AccountWithAmount } from '../../models/account-with-amount';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { IonModal,ToastController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { AlertController } from '@ionic/angular';
import { GetAccountService } from '../../services/get-account.service';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})

export class AccountPage implements OnInit {
  @ViewChild(IonModal) modal: IonModal;

  handlerMessage = "";
  importedMnemonic: string;
  inputMnemonic: string;
  
  public accountList:Array<AccountStored> = [];
  public accountListWithAmount:Array<AccountWithAmount> = [];
  
  constructor( private router:Router,
    private route:ActivatedRoute,
    private apiService: Blockchain2Service,
    private blockchainSDKService: Blockchain3Service,
    private storageService: StorageService,
    public toastController: ToastController,
    private header: HeaderService,
    private alertController: AlertController,
    private getAccountService:GetAccountService,
    private navigation:NavigationService,
    ) { 

    }

  ngOnInit() {
    this.getAccountList();
  }

  ionViewWillEnter(){
    
  }

  createAccount(){
    this.blockchainSDKService.createAccount().then(async(response)=>{
      console.log(response);
      var responseToAny:any = response;
      var name = "Account"+(this.accountList.length + 1);
      var responseArr = responseToAny.split(":");
      var newAccount:AccountStored = new AccountStored();
      newAccount.isMain = false;
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

      //싱글톤 getAccount서비스의 목록도 업데이트
      // var tempList = this.accountList;
      // for(var i = 0; i < tempList.length; i++){
      //   var index = tempList.indexOf(tempList[i]);
      //   tempList[index].mnemonic = "";
      // }
      this.getAccountService.setAccountList(this.accountList);   
    });
  }

  storeAccount(){
    return this.storageService.setEncryption("accounts",this.accountList, null);
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
       var accountStored:AccountStored = new AccountStored();
       type Temp = {
         [key:string]: any
       }
       var temp:Temp = responseToAny[i];
       accountStored.isMain = temp.isMain;
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

  async getAmountByAccount(){
    for (var item of this.accountListWithAmount){
      var accountData:any = await this.apiService.getAccountInfo(item.account.addr)
      var accountAmount:number = accountData.account.amount;
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
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      var name = "Account"+(this.accountList.length + 1);
      var newAccount:AccountStored = new AccountStored();
      newAccount.isMain = false;
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

      //싱글톤 getAccount서비스의 목록도 업데이트
      // var tempList = this.accountList;
      // for(var i = 0; i < tempList.length; i++){
      //   var index = tempList.indexOf(tempList[i]);
      //   tempList[index].mnemonic = "";
      // }
      this.getAccountService.setAccountList( this.accountList);  

      }else{

    }
  }

  async changeAccount(accountWithAmount){
    var account = accountWithAmount.account;
    //mainAccount를 바꾼다.
    //isMain=true인 새 계정을 만들고, 다른 리스트를 false로 수정한후, 
    // 바꾸려는 아이템의 인덱스를 찾아 해당 아이템을 새 계정으로 바꾼다.
    //html업데이틀 위해 배열을 지웠다가 새로 할당한다. (angular에게 참조 값 자체 변경 알림)
    var newAccount:AccountStored = new AccountStored();
    newAccount.isMain = true;
    newAccount.name = account.name;
    newAccount.addr = account.addr;
    newAccount.mnemonic = account.mnemonic;
    for(var i = 0; i<this.accountList.length; i++){
      this.accountList[i].isMain = false;
    }
    var index = this.accountList.indexOf(account);
    if (index !== -1) {
      this.accountList[index] = newAccount;
    }
    await this.storeAccount();

    //보유금액과 같이 있는 배열을 업데이트한다.
    //새로 보유금액과 같이 있는 계정 아이템 생성해서 변경한 계정정보와 기존 금액 정보 가져와서
    //보유금액과 같이 있는 배열 목록의 해당 아이템 교체 후 기존 배열 삭제 후 다시 추가(html 업데이트)
    var newAccountWithAmount:AccountWithAmount = new AccountWithAmount();
    newAccountWithAmount.account = newAccount;
    newAccountWithAmount.amount = accountWithAmount.amount;
    var index = this.accountListWithAmount.indexOf(accountWithAmount);
    if (index !== -1) {
      this.accountListWithAmount[index] = newAccountWithAmount;
    }
    var tempAccountWithAmountList = this.accountListWithAmount;
    this.accountListWithAmount.slice();
    this.accountListWithAmount = tempAccountWithAmountList;
    this.handleToastController("The main account changed successfully.");
    
    //싱글톤 getAccount서비스의 목록도 업데이트
    // var tempList = this.accountList;
    // for(var i = 0; i < tempList.length; i++){
    //   var index = tempList.indexOf(tempList[i]);
    //   tempList[index].mnemonic = "";
    // }
    this.getAccountService.setAccountList(this.accountList);   
  }

  async changeAccountName(newAccountName,accountWithAmount){
    var account = accountWithAmount.account;
    var newAccount:AccountStored = new AccountStored();
    newAccount.isMain = account.isMain;
    newAccount.name = newAccountName;
    newAccount.addr = account.addr;
    newAccount.mnemonic = account.mnemonic;
    var index = this.accountList.indexOf(account);
    if (index !== -1) {
      this.accountList[index] = newAccount;
    }
    console.log(this.accountList);
    var tempAccountList = this.accountList;
    this.accountList.slice();
    this.accountList = tempAccountList;
    await this.storeAccount();

    //html업데이트 위해서 변수 재정의 후 배열 삭제 후 재생성
    var newAccountWithAmount:AccountWithAmount = new AccountWithAmount();
    newAccountWithAmount.account = newAccount;
    newAccountWithAmount.amount = accountWithAmount.amount;
    var index = this.accountListWithAmount.indexOf(accountWithAmount);
    if (index !== -1) {
      this.accountListWithAmount[index] = newAccountWithAmount;
    }
    var tempAccountWithAmountList = this.accountListWithAmount;
    this.accountListWithAmount.slice();
    this.accountListWithAmount = tempAccountWithAmountList;
    this.handleToastController("The account name changed successfully.");
    
    //싱글톤 getAccount서비스의 목록도 업데이트
    // var tempList = this.accountList;
    // for(var i = 0; i < tempList.length; i++){
    //   var index = tempList.indexOf(tempList[i]);
    //   tempList[index].mnemonic = "";
    // }
    this.getAccountService.setAccountList(this.accountList);  
  }

  goToExportPage(){
    const navigationExtras: NavigationExtras = {
    };
    this.router.navigateByUrl('/export-list',navigationExtras);
  }

  async presentNameInputAlert(accountWithAmount) {
    const alert = await this.alertController.create({
      header: 'Please enter new account name',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {  }
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: (input) => { 
            console.log("input",input);
            this.changeAccountName(input.accountName,accountWithAmount); }
        }
      ],
      inputs: [
        {
          name:'accountName',
          placeholder: ''
        },
      ]
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    
  }

}
