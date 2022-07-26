import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../../services/header.service';
import { AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { AccountStored } from '../../models/account-stored';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-change-pw-modal',
  templateUrl: './change-pw-modal.html',
})
export class ChangePWModal {
  private pw = ""; 
  private confirmedPw = "";
  public isDisabledSignUp = true;
  accountList:Array<AccountStored>;
  //저장된 account목록을 불러왔다가 새로운 비밀번호로 다시 저장하기 위함.
  constructor(private modalCtrl: ModalController,
    private alertController: AlertController,
    private storageService: StorageService,
    private header:HeaderService,
    ) {

    }

  
  //change password버튼이 활성화되면 이 함수 호출
  changePassword(){
    this.hashAndStorePw(this.confirmedPw).then(response=>{
       //저장 완료되면 메세지 보여주고 modal 닫기
       this.presentAlert();
    });
  }

  hashAndStorePw(pw){
    return new Promise(async resolve=>{
      //비밀번호 해쉬화해서 저장
      //계정정보를 가져온 후의 키를 새로운 비밀번호 해쉬값으로 저장
      var accounts:any = await this.storageService.getDecryption("accounts",null); //이 시점까지는 hashedPW가 옛날것 
      console.log("accounts",accounts);
      this.accountList = accounts;
      await this.storageService.setHashedEncryption("keyForUser",pw,pw);  //이 시점에서 hashedPW가 새로운 것으로 바뀐다.
      await this.storageService.setEncryption("accounts",this.accountList, null);
      return resolve(true);
    });
  }

  checkValidation(ev:any){
    if(!this.validatePassword(ev.target.value)){
      this.pw = "error";
    }else{
      this.pw = ev.target.value;
    }
  }

  
  //입력한 두개의 비밀번호가 일치하는지 확인
  checkConfirm(ev:any){
    this.confirmedPw = ev.target.value;
    if(this.pw == this.confirmedPw){
      this.isDisabledSignUp = false;
    }else{

    }

  }


  //비밀번호가 정규식에 맞게 유효한지 확인
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

  
  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Successfully changed!',
      buttons: [
        {
          text: 'OK',
          role: 'confirm',
          handler: () => { this.cancel(); }
        }
      ]
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
  }



//   confirm() {
//     return this.modalCtrl.dismiss(this.name, 'confirm');
//   }


}