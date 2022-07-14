import { Component, OnInit } from '@angular/core';
import { Blockchain3Service } from '../../services/blockchain3.service';
import { StorageService } from '../../services/storage.service';
import { AccountStored } from '../../models/account-stored';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  public accountList:Array<AccountStored> = [];
  private pw = ""; 
  private confirmedPw = "";
  public isDisabledSignUp = true;
  private accountCreated:AccountStored;
  constructor(private router:Router,
    private route:ActivatedRoute,
    private blockchainSDKService: Blockchain3Service,
    private storageService: StorageService,) { }

  ngOnInit() {
  }

  signup(){
    this.hashAndStorePw(this.confirmedPw).then(response=>{
      const navigationExtras: NavigationExtras = {
        state: {
          isLogin:true,
          account:this.accountCreated,
        },
      };
      this.router.navigateByUrl('/wallet',navigationExtras);
    });
  }

  checkValidation(ev:any){
    let typedPw = ev.target.value;
    if(!this.validatePassword(typedPw)){
      //에러 메세지 팝업
    }else{
      this.pw = typedPw;
    }
  }

  checkConfirm(ev:any){
    let confirmPw = ev.target.value;
    if(this.pw == confirmPw){
      this.confirmedPw = this.pw;
      this.isDisabledSignUp = false;
    }else{

    }

  }

  validatePassword(pw) {
    var newPassword = pw;
    var minNumberofChars = 8;
    var maxNumberofChars = 12;
    var regularExpression = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    if(newPassword.length < minNumberofChars || newPassword.length > maxNumberofChars){
        return false;
    }else{
      if(!regularExpression.test(newPassword)) {
        return false;
      }else{
        return true;
      }
    }

}

  hashAndStorePw(pw){
    return new Promise(async resolve=>{
      await this.storageService.setHashedEncryption("keyForUser",pw,pw);
      this.createAccount();
      return true;
    })
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
      this.accountCreated = newAccount;
      this.accountList.push(newAccount);
      this.storeAccount();
    });
  }

  storeAccount(){
    this.storageService.setEncryption("accounts",this.accountList, null);
  }

}
