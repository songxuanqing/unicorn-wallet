import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { AccountStored } from '../../models/account-stored';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  pw = "";
  account:AccountStored;
  constructor(private router:Router,
    private route:ActivatedRoute,
    private storageService: StorageService,) { }

  ngOnInit() {
  }

  async confirm(pw) {
    return new Promise(async (resolve)=>{
      var isCorrectPw = await this.storageService.getHashedDecryption("keyForUser",pw);
      if(isCorrectPw){
        this.storageService.getDecryption("accounts",null).then(async(response)=>{
          var responseToAny:any = response;  
          this.account = await this.getAccountListFromStorage(responseToAny);
          return resolve(true);
        });
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

  goToWallet(){
    const navigationExtras: NavigationExtras = {
      state: {
        account:this.account,
      },
    };
    this.router.navigateByUrl('/wallet',navigationExtras);
  }

  getAccountListFromStorage = (responseToAny): Promise<AccountStored> =>{
    return new Promise<AccountStored>((resolve, reject)=>{
      var getAccount = responseToAny[0];
      var account = new AccountStored();
      account.addr = getAccount.addr;
      account.name = getAccount.name;
      return resolve(account);
    })
  }


}
