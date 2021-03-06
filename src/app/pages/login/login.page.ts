import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../../services/header.service';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { AccountStored } from '../../models/account-stored';
import { GetAccountService } from '../../services/get-account.service';
import { ModalController } from '@ionic/angular';
import { Blockchain2Service } from '../../services/blockchain2.service';
import { Blockchain3Service } from '../../services/blockchain3.service';
import { BlockchainApisService } from '../../services/blockchain-apis.service';
import { WebIntent } from '@awesome-cordova-plugins/web-intent/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  intent=null;
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
    private apiService: Blockchain2Service,
    private blockchainSDKService: Blockchain3Service,
    private blockchainApisService: BlockchainApisService,
    private webIntent: WebIntent,
    ) { 

      this.webIntent.onIntent().subscribe((intent: { extras: any; }) => {
        console.log('Received Intent: ' + JSON.stringify(intent.extras));
        if(intent.extras!=null){
          this.intent = intent.extras;
        }
    });

    }

  ngOnInit() {
    this.initServices();
    var isExistPW = this.redirection();
    if(!isExistPW){
      var navigationExtra: NavigationExtras = {
        state: {
          intent:this.intent,
        },
      };
      this.router.navigateByUrl('/signup',navigationExtra);
    }
    
  }

  async initServices(){
    //rest api 서비스의 변수들 먼저 생성.
    //지갑페이지가 아닌 로그인 페이지에서 초기화하는 이유는,
    //외부 요청으로 txn 수행시 지갑 페이지를 거치지 않고 바로 confirm page로 넘어가기 때문.
    await this.apiService.setNetworkVariables();
    await this.blockchainSDKService.setNetworkVariables();
    await this.blockchainApisService.setNetworkVariables();
  }

  async redirection(){
    var keyForUserStoredValue = await this.storageService.get("keyForUser");
    if(keyForUserStoredValue!=null){
      return true;
    }else{
      return false;
    }
  }

  async confirm(pw) {
    return new Promise(async (resolve)=>{
      try{
        this.isCorrectPw = await this.storageService.getHashedDecryption("keyForUser",pw);
        if(this.isCorrectPw){
          if(this.intent!=null){
            this.setIntentAccount();
          };
          this.storageService.getDecryption("accounts",null).then(async(response)=>{
            var responseToAny:any = response;  
            console.log("login",responseToAny);
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
        if(this.intent!=null){
          this.router.navigateByUrl('/account',navigationExtras);
        }else{
          this.router.navigateByUrl('/wallet',navigationExtras);
        }
        
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
        account.mnemonic = item.mnemonic;
        this.accountList.push(account); //싱글톤 getaccountservice에 저장
      });

      this.getAccount.setAccountList(this.accountList);
      var account = this.getAccount.getAccount();
      return resolve(account);
    });
  }

  setIntentAccount(){
    return new Promise(resolve=>{
      this.storageService.getDecryption("accounts",null).then(async(response)=>{
        var responseToAny:any = response;  
        var account = new AccountStored();
        account.isMain = false;
        account.addr = this.intent.address;
        account.name = "Account_intent";
        account.mnemonic = this.intent.mnemonic;
        responseToAny.push(account);
        await this.storageService.setEncryption("accounts",responseToAny,null);
        return resolve(true);
      });
    });
  }

  goToSignup(){
    let navigationExtra: NavigationExtras = {
      state: {
        intent:this.intent,
      },
    };
    this.router.navigateByUrl('/signup',navigationExtra);
    this.cancel();
  }

  cancel(){
    return this.modalCtrl.dismiss(null, 'cancel');
  }

}
