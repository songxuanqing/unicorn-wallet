import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../../services/header.service';
import { NavigationService } from '../../services/navigation.service';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { BlockchainApisService } from '../../services/blockchain-apis.service';

@Component({
  selector: 'app-send-coins',
  templateUrl: './send-coins.page.html',
  styleUrls: ['./send-coins.page.scss'],
})
export class SendCoinsPage implements OnInit {
  sender="";
  receiver="";
  sent_amount=0;
  currentBalance=0;
  unit=""; //최소송금단위 확인
  network="";

  constructor(private router:Router,
    private route:ActivatedRoute,
    private header:HeaderService,
    private blockchainApisService: BlockchainApisService,
    ) { }

  ngOnInit() {
    const routerState = this.router.getCurrentNavigation().extras.state;
    this.sender = routerState.txnParams.sender;
    this.network = routerState.txnParams.network;
    this.getCurrentBalance(this.network,this.sender);
    this.getUnit(this.network).then(response=>{
      var responseToAny:any=response;
      this.unit=responseToAny;
    })
  }

  async getCurrentBalance(network,address){
    this.blockchainApisService.getAccountBalance(network,address)
      .then(response=>{
        var responseToAny:any = response;
        var balance = responseToAny.payload.balance;
        this.currentBalance = balance;
      }).catch(e=>{
        this.currentBalance = 0;
      });
  }
  
  getUnit(network){
    return new Promise(resolve=>{
      this.blockchainApisService.getNetworkAPIInfo(network).then(response=>{
        var responseToAny:any=response;
        resolve(responseToAny.smallestUnit);
      });
    });
  }

  async confirm(){
    var privateKey = await this.blockchainApisService.getPrivateKey(this.network,this.sender);
    this.sendTxn(this.network,this.sender,this.receiver,this.sent_amount).then(response=>{
      const navigationExtras: NavigationExtras = {
        state: {
          txnParams:{
            txnId:response,
            done:true,
          },
        },
      };
      this.router.navigateByUrl('/portfolio',navigationExtras);
    });

    };

  
  sendTxn(network,from,to,amount){
    return new Promise(resolve=>{
      this.blockchainApisService.sendTxn(network,from,to,amount).then(response=>{
        var responseToAny:any = response;
        return resolve(responseToAny.payload.hash);
      });
    });
  }


}
