import { Component, OnInit } from '@angular/core';
import { Blockchain3Service } from '../../services/blockchain3.service';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-send',
  templateUrl: './send.page.html',
  styleUrls: ['./send.page.scss'],
})

export class SendPage implements OnInit {
  public recentlySentAddresses:string[] = ['CSWVHEEZDZQR452LEYCJGNBRDZU7SSKANOA32OPOKNBMYJSAV5BNZEXIXA','Q7LS5VUYTPV7NKMMKFT22Z3A2DWSHUQQA74ILF7OXRKMN3HRQ7VC57EELU']
  public sender:string;
  public receiver:string;
  public token_id:number;
  public token_unit:string;

  constructor(
    private router:Router,
    private route:ActivatedRoute,
    private blockchainSDKService: Blockchain3Service,
    public toastController: ToastController,
    ) {

   }

  ngOnInit() {
    const routerState = this.router.getCurrentNavigation().extras.state;
    console.log(routerState);
    this.sender = routerState.txnParams.sender;
    this.token_id = routerState.txnParams.token_id;
    this.token_unit = routerState.txnParams.token_unit;
  }

  goToConfirmPage(receiver_address){
    const navigationExtras: NavigationExtras = {
      state: {
        txnParams:{
          token_id: this.token_id,
          sender: this.sender,
          receiver : receiver_address,
          token_unit: this.token_unit,
        },
      },
    };
    this.router.navigateByUrl('/confirm',navigationExtras);
  }

  //입력한 주소가 유효한지 확인
  //유효할 경우 자동으로 다음 페이지로 넘어감
  async isValidAddress(address){
    this.blockchainSDKService.isValidAddress(address).then(resolve=>{
      if(isValid){
        this.goToConfirmPage(address);
      }
    }).then(reject=>{
      //유효하지 않은 주소 에러 발생 시 메세지 띄우고 입력창 초기화
        this.resentToastWithOptions(reject);
        this.receiver = "";
    });
  }

  //최근 보낸 주소 가져오기
  

  async presentToastWithOptions(e) {
    const toast = await this.toastController.create({
      message: e,
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
    const { role } = await toast.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

}
