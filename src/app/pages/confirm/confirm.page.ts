import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/blockchain.service';
import { BlockchainSDKService } from '../../services/blockchain-sdk.service';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.page.html',
  styleUrls: ['./confirm.page.scss'],
})
export class ConfirmPage implements OnInit {
  public sender:string;
  public receiver:string;
  public token_id:number;
  public token_unit:string;
  public sent_amount:number = 0;
  public fee:number;
  public total:number;
  public currentBalance:number;

  constructor(
    private router:Router,
    private route:ActivatedRoute,
    private apiService: ApiService,
    private blockchainSDKService: BlockchainSDKService,
    ) {
      
   }


   ngOnInit() {
    const routerState = this.router.getCurrentNavigation().extras.state;
    console.log(routerState);
    this.sender = routerState.txnParams.sender;
    this.receiver = routerState.txnParams.receiver;
    this.token_id = routerState.txnParams.token_id;
    this.token_unit = routerState.txnParams.token_unit;
    this.getCurrentBalance(this.sender, this.token_id);
    this.getMinFee();
    this.getFee();
  }


  confirm(){
    this.blockchainSDKService.sendTxn(this.sender,this.receiver,this.token_id,this.sent_amount).then(async(response)=>{
      console.log(response);
    });
    const navigationExtras: NavigationExtras = {
      state: {
        txnParams:{
          done:true,
        },
      },
    };
    this.router.navigateByUrl('/wallet',navigationExtras);
}

  updateFeeAndTotal(inputAmount){
    this.getFee();
    this.calculateTotal(inputAmount);
  }

  calculateTotal(inputAmount){
    console.log("inputAmount"+inputAmount);
    console.log("type of input"+typeof inputAmount)
    console.log("sent_Amount"+this.sent_amount);
    this.sent_amount = +inputAmount;
    this.total = +this.sent_amount + +this.fee;
  }


  getFee(){
    this.blockchainSDKService.txnToByte(this.sender,this.receiver,this.token_id,this.sent_amount).then(async(response)=>{
      var len = +response;
      this.apiService.getTxnParam().then(async(response)=>{
        console.log(response);
        var fee = response.fee;
        var min_fee = response['min-fee'];
        var totalFee = Math.max((len*fee),min_fee);
        this.fee = totalFee;
        return this.fee;
      })
      
    });
  }

  getMinFee(){
    this.blockchainSDKService.getMinFee().then(async(response)=>{
      console.log(response);
    });
  }

  getCurrentBalance(account_address, token_id){
    this.apiService.getAddressAssetInfo(account_address, token_id).then(async (response) => {
      console.log(response);
      this.currentBalance = response['asset-holding'].amount;
      return this.currentBalance;
    });
  }

}
