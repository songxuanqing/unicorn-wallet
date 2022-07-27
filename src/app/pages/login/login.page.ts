import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../../services/header.service';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { AccountStored } from '../../models/account-stored';
import { GetAccountService } from '../../services/get-account.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  pw = "";
  isCorrectPw = null;
  account:AccountStored;
  accountList:Array<AccountStored> = [];
  title = "Reset Wallet"
  introduction = "Unicorn Wallet does not keep a copy of your password. If you’re having trouble unlocking your account, you will need to reset your wallet by signing up again. This action will delete your current wallet and Secret Recovery Phrase from this device, along with the list of accounts you’ve curated. After creating new password, please import a Secret Recovery Phrase(mnemonic) or create new account."
  constructor(private router:Router,
    private route:ActivatedRoute,
    private storageService: StorageService,
    private header:HeaderService,
    private getAccount: GetAccountService, //싱글톤 account 객체. 여러 페이지 참조 위함.
    private modalCtrl: ModalController,
    ) { }

  ngOnInit() {
    
    
  }

  async redirection(){
    
  }

  async confirm(pw) {
    return new Promise(async (resolve)=>{
      try{
        this.isCorrectPw = await this.storageService.getHashedDecryption("keyForUser",pw);
        if(this.isCorrectPw){
          this.storageService.getDecryption("accounts",null).then(async(response)=>{
            var responseToAny:any = response;  
            this.account = await this.getAccountListFromStorage(responseToAny);
            return resolve(true);
          });
        }else{
          this.isCorrectPw = false;
        }
      }catch(e){
        console.log(e);
        this.isCorrectPw = false;
      }

    })
  }


  
  async unlock(pw){
    var isConfirmed = await this.confirm(pw);
    console.log("isConfirmed",isConfirmed);
    if(isConfirmed){
      //background.js에서 다른 웹사이트로부터 받은 
      //송수신자,금액 데이터를 storage에 저장함. 
      //따라서 storage 정보가 있을 경우 confirm page로 이동.
      var sendTxnStoredValue = await this.storageService.get('sendTxn');
      const navigationExtras: NavigationExtras = {
        state: {
          isLogin:true,
          account:this.account,
        },
      };
      if(sendTxnStoredValue!=null){
        this.router.navigateByUrl('/confirm',navigationExtras);
      }else{
        this.router.navigateByUrl('/wallet',navigationExtras);
      }
    }
  }


  getAccountListFromStorage = (responseToAny): Promise<AccountStored> =>{
    return new Promise<AccountStored>((resolve, reject)=>{
      responseToAny.forEach(item=>{
        var account = new AccountStored();
        account.isMain = item.isMain;
        account.addr = item.addr;
        account.name = item.name;
        this.accountList.push(account); //싱글톤 getaccountservice에 저장
      });
      this.getAccount.setAccountList(this.accountList);
      var account = this.getAccount.getAccount();
      return resolve(account);
    })
  }

  goToSignup(){
    let navigationExtra: NavigationExtras = {};
    this.router.navigateByUrl('/signup',navigationExtra);
    this.cancel();
  }

  cancel(){
    return this.modalCtrl.dismiss(null, 'cancel');
  }

}
