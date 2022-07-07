import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/blockchain.service';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';


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
    private apiService: ApiService,
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

}
