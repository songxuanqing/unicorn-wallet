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
    var isAssetTransfer:boolean; //나중에 해당 변수를 페이지 시작시 정의하는 것으로 변경 필요. service의 sendTxn도 하나로 통일
    if(this.token_id!=null){
      isAssetTransfer = true;
    }else{
      isAssetTransfer = false;
    }
    //니모닉 가져와서 전달
    var mnemonic = await this.getMnemonic(this.sender);
    this.blockchainSDKService.sendTxn(this.sender,mnemonic,this.receiver,this.token_id,this.sent_amount,isAssetTransfer).then(async(response)=>{
      console.log(response);
    });
    //최근 보낸 주소 저장.
    this.setRecentlySentAddresses(this.receiver);
    //만약 외부에서 요청한 것일 경우 sendTxn 데이터가 저장되어 있을 것이므로
    //해당 데이터가 DB에 있다면 wallet으로 이동하고, DB 초기화
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

  //db에 최근 보낸 주소를 가져온 다음, 현재 항목을 추가해서 다시 저장.
  setRecentlySentAddresses(receiver){
    return new Promise(resolve=>{
      this.storageService.get("recentlySent").then(response=>{
        //최초 사용일 경우 저장소에 값이 없으므로, 빈 배열 생성
        var recentlySentAddresses;
        if(response!=null){
          var responseJson = JSON.parse(response);
          recentlySentAddresses = responseJson.addressList; //{addressList:[A,B,C]}
        }else{
          recentlySentAddresses = [];
        }
        var isExistSameAddress = false;
        //기존에 저장된 주소에서 현재 전송한 주소와 동일한 주소가 있는지 확인
        //하나라도 존재할 경우 true이므로, 추가 저장하지 않는다.
        //아닐 경우 배열에 추가한 후 저장한다.
        recentlySentAddresses.forEach(item=>{ 
          if(item!=receiver){
            isExistSameAddress = false; 
          }else{
            isExistSameAddress = true;
          }
        });
        //최초 생성일 경우 빈 배열이므로, forEach문에 해당하지 않아, isExistSameAddress = false;
        if(!isExistSameAddress){
          recentlySentAddresses.push(receiver); 
        };
        var recentlySentObj = {addressList:recentlySentAddresses}; //{addressList:[A,B,C]}
        var recentlySentToString = JSON.stringify(recentlySentObj); //스트링으로 변환해서 저장
        this.storageService.set("recentlySent",recentlySentToString);
      });
    });
  };

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


  async getFee(){
    //토큰(에셋) 전송인지 아니면 코인 전송인지에 따라 서비스 내 txnToByte의 내부
    //로직이 달라지므로, token_id가 없다면 토큰 전송을하지 않는 것이므로, 변수로 false를 반환.
    var isAssetTransfer:boolean; //나중에 해당 변수를 페이지 시작시 정의하는 것으로 변경 필요. service의 sendTxn도 하나로 통일
    if(this.token_id!=null){
      isAssetTransfer = true;
    }else{
      isAssetTransfer = false;
    }
    //니모닉 가져와서 전달
    var mnemonic = await this.getMnemonic(this.sender);
    this.blockchainSDKService.txnToByte(this.sender,mnemonic,this.receiver,this.token_id,this.sent_amount,isAssetTransfer).then(async(response)=>{
      var len = +response;
      console.log("lent",len);
      this.apiService.getTxnParam().then(async(response)=>{
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
    if(this.token_id!=null || this.token_id!=undefined){
      this.apiService.getAddressAssetInfo(account_address, token_id).then((response) => {
        console.log(response);
        this.currentBalance = response['asset-holding'].amount;
        return this.currentBalance;
      });
    }else{
      this.apiService.getAccountInfo(account_address).then((response) => {
        var accountData:any = response;
        this.currentBalance = accountData.amount;
        return this.currentBalance;
      });
    };
  };

  getMnemonic(sender){
    return new Promise (resolve=>{
      this.storageService.getDecryption("accounts",null).then(async(response)=>{
        var accounts:any = response;  
        var mnemonic = "";
        accounts.forEach(item=>{
          if(sender == item.addr){
            mnemonic = item.mnemonic;
          };
        });
        return resolve(mnemonic);
      });
    });
  };

}