import { Component, OnInit } from '@angular/core';
import { Blockchain2Service } from '../../services/blockchain2.service';
import { Blockchain3Service } from '../../services/blockchain3.service';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { AccountStored } from '../../models/account-stored';
import { StorageService } from '../../services/storage.service';

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
  public account:AccountStored; //외부 요청받아 login페이지에서 confirm 페이지로 이동했을 경우 
  //txn요청 완료 후 wallet페이지로 이동하기 위해 login페이지에서 받은 account정보를 저장

  constructor(
    private router:Router,
    private route:ActivatedRoute,
    private apiService: Blockchain2Service,
    private blockchainSDKService: Blockchain3Service,
    private storageService: StorageService,
    ) {
      
   }


   ngOnInit() {
    const routerState = this.router.getCurrentNavigation().extras.state;
    //background.js에서 다른 웹사이트로부터 받은 송수신자,금액 데이터를 세션에 저장함. 
    //따라서 세션에 데이터가 있는 경우 해당 데이터를 가져와서 파싱함.
    this.storageService.get('sendTxn').then(response=>{
      var sendTxnStoredValue = response;
      if(sendTxnStoredValue!=null){
        //json객체를 string으로 저장하였으므로, 다시 json으로 변환
        var json = JSON.parse(sendTxnStoredValue);
        console.log("get result json",json);
        this.sender = json.sender;
        this.receiver = json.receiver;
        this.sent_amount = json.amount;
        //session정보를 받아오는 경우 login page에서 바로 이동했으므로,
        //파라미터로 account정보 있음.
        this.account = routerState.account;
        console.log(this.sender);
        console.log(this.account);
        console.log("routerState.account",routerState.account);
      }else{
        console.log(routerState);
        this.sender = routerState.txnParams.sender;
        this.receiver = routerState.txnParams.receiver;
        this.token_id = routerState.txnParams.token_id;
        this.token_unit = routerState.txnParams.token_unit;
      }
      this.getCurrentBalance(this.sender, this.token_id);
      this.getMinFee();
      this.getFee();
    })
  }


  async confirm(){
    if(this.token_id!=null){
      this.blockchainSDKService.sendAssetTxn(this.sender,this.receiver,this.token_id,this.sent_amount).then(async(response)=>{
        console.log(response);
      });
    }else{
      this.blockchainSDKService.sendTxn(this.sender,this.receiver,this.sent_amount).then(async(response)=>{
        console.log(response);
      });
    }
    var sendTxnStoredValue = await this.storageService.get("sendTxn");
    if(sendTxnStoredValue!=null){
      const navigationExtras: NavigationExtras = {
        state: {
          txnParams:{
            done:true,
          },
          account:this.account,
        },
      };
      this.router.navigateByUrl('/wallet',navigationExtras);
      this.storageService.remove('sendTxn');
    }else{
      const navigationExtras: NavigationExtras = {
        state: {
          txnParams:{
            done:true,
          },
        },
      };
      this.router.navigateByUrl('/wallet',navigationExtras);
    }
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
    //토큰(에셋) 전송인지 아니면 코인 전송인지에 따라 서비스 내 txnToByte의 내부
    //로직이 달라지므로, token_id가 없다면 토큰 전송을하지 않는 것이므로, 변수로 false를 반환.
    var isAssetTransfer:boolean;
    if(this.token_id!=null){
      isAssetTransfer = true;
    }else{
      isAssetTransfer = false;
    }
    this.blockchainSDKService.txnToByte(this.sender,this.receiver,this.token_id,this.sent_amount,isAssetTransfer).then(async(response)=>{
      var len = +response;
      this.apiService.getTxnParam().then(async(response)=>{
        console.log(response);
        var res:any = response;
        var fee = res.fee;
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
    if(this.token_id!=null){
      this.apiService.getAccountInfo(account_address).then((response) => {
        var accountData:any = response;
        this.currentBalance = accountData.amount;
        return this.currentBalance;
      });
    }else{
      this.apiService.getAddressAssetInfo(account_address, token_id).then((response) => {
        console.log(response);
        this.currentBalance = response['asset-holding'].amount;
        return this.currentBalance;
      });
    }
    
  }

  

}