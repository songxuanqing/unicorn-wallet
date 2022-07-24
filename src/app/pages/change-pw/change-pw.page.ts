import { Component } from '@angular/core';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { AccountStored } from '../../models/account-stored';
import { ModalController } from '@ionic/angular';
import { ChangePWModal } from './change-pw-modal';

@Component({
  selector: 'app-change-pw',
  templateUrl: './change-pw.page.html',
  styleUrls: ['./change-pw.page.scss'],
})

export class ChangePWPage {
  pw = "";

  constructor( private router:Router,
    private route:ActivatedRoute,
    private storageService: StorageService,
    private modalCtrl: ModalController) { }

  
  //현재 비밀번호 Next눌러 입력 후 아래 함수 호출
  async unlock(pw){
    var isConfirmed = await this.storageService.getHashedDecryption("keyForUser",pw);
    console.log("isConfirmed",isConfirmed);
    if(isConfirmed){
      //확인될 경우 새로운 비밀번호 입력 modal열기
      this.openChangePWModal();
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
