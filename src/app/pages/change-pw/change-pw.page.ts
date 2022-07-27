import { Component } from '@angular/core';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { AccountStored } from '../../models/account-stored';
import { ModalController } from '@ionic/angular';
import { ChangePWModal } from './change-pw-modal';
import { HeaderService } from '../../services/header.service';

@Component({
  selector: 'app-change-pw',
  templateUrl: './change-pw.page.html',
  styleUrls: ['./change-pw.page.scss'],
})

export class ChangePWPage {
  pw = "";
  isCorrectPw = null;

  constructor( private router:Router,
    private route:ActivatedRoute,
    private storageService: StorageService,
    private modalCtrl: ModalController,
    private header:HeaderService,) { }

  
  //현재 비밀번호 Next눌러 입력 후 아래 함수 호출
  async unlock(pw){
    try{
      this.isCorrectPw = await this.storageService.getHashedDecryption("keyForUser",pw);
      if(this.isCorrectPw){
        //확인될 경우 새로운 비밀번호 입력 modal열기
        this.openChangePWModal();
      }else{
        this.isCorrectPw = false;
      };
    }catch(e){
      this.isCorrectPw = false;
    };
  };

  async openChangePWModal() {
    const modal = await this.modalCtrl.create({
      component: ChangePWModal,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if(role=='cancel'){
      const navigationExtras: NavigationExtras = {
      };
      this.router.navigateByUrl('/setting',navigationExtras);
    }
  }


}
