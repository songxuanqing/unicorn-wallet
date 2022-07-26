import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../../services/header.service';
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
  constructor(private router:Router,
    private route:ActivatedRoute,
    private blockchainSDKService: Blockchain3Service,
    private storageService: StorageService,
    private header:HeaderService,
    ) { }

  ngOnInit() {
  }

  signup(){
    this.hashAndStorePw(this.confirmedPw).then(response=>{
      console.log("done up to move");
      const navigationExtras: NavigationExtras = {
      };
      this.router.navigateByUrl('/import-or-create',navigationExtras);
    });
  }

  checkValidation(ev:any){
    if(!this.validatePassword(ev.target.value)){
      this.pw = "error";
    }else{
      this.pw = ev.target.value;
    }
  }

  checkConfirm(ev:any){
    this.confirmedPw = ev.target.value;
    if(this.pw == this.confirmedPw){
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
      return resolve(true);
    })
  }


}
