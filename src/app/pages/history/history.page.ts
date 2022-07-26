import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderService } from '../../services/header.service';
import { Blockchain2Service } from '../../services/blockchain2.service';
import { Blockchain3Service } from '../../services/blockchain3.service';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { TxnHistory } from '../../models/txn-history';
import { Token } from '../../models/token';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { IonInfiniteScroll } from '@ionic/angular';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  public account_address= "";
  public historyList:Array<TxnHistory> = [];
  public assetInfo:Array<Token> = [];
  public selectedTokenAssetID:number|null = 0.1;
  public nextToken = "";
  public isHistoryExist:boolean = true; //거래기록 여부 확인. true일 경우 거래기록 없다는 메세지 hidden도 true이다.

  @ViewChild(IonModal) modal: IonModal;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  constructor(private router:Router,
    private route:ActivatedRoute,
    private apiService: Blockchain2Service,
    private blockchainSDKService: Blockchain3Service,
    private header:HeaderService,
    private navigation:NavigationService,
    ) { 

    }

  ngOnInit() {
    const routerState = this.router.getCurrentNavigation().extras.state;
    // console.log(routerState);
    this.account_address = routerState.txnParams.sender;
    this.getTransactionHistory(this.account_address,this.nextToken);
  }

  select(token){
    this.modal.dismiss(token, 'selected');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'selected') {
      this.selectedTokenAssetID = +ev.detail.data;
      this.nextToken="";
      if(this.selectedTokenAssetID==0.1){
        this.getTransactionHistory(this.account_address,this.nextToken);
      }else if(this.selectedTokenAssetID==0){
        this.getCoinTransactionHistory(this.account_address,'pay',this.nextToken);
      }else{
        this.getSelectedTokenTransactionHistory(this.account_address,this.selectedTokenAssetID,this.nextToken);
      }
      }else{

    }
  }

  loadData(event) {
    setTimeout(() => {
      console.log('Loading Data');
      if(this.selectedTokenAssetID==0.1){
        this.getTransactionHistory(this.account_address,this.nextToken);
      }else if(this.selectedTokenAssetID==0){
        this.getCoinTransactionHistory(this.account_address,'pay',this.nextToken);
      }else{
        this.getSelectedTokenTransactionHistory(this.account_address,this.selectedTokenAssetID,this.nextToken);
      }
      console.log('Done');
      event.target.complete();
    }, 500);
  }

 getTokenList(address){
    var all = new Token();
    all.name = "ALL";
    all['asset-id'] = 0.1;
    var coin = new Token();
    coin.name = "Algo";
    coin['asset-id'] = 0;
    this.assetInfo.push(all);
    this.assetInfo.push(coin);
    this.apiService.getAccountInfo(address).then(async (response) => {
      console.log("his",response);
      var accountData:any = response;
      accountData = accountData.account;
      console.log(accountData.assets);
      accountData.assets.forEach(async (item)=>{
      var token = new Token();
      token.amount = item.amount;
      token['asset-id'] = item['asset-id'];
      token['is-frozen'] = item['is-frozen'];
      token = await this.getAssetInfo(token,item['asset-id']);
      this.assetInfo.push(token);
      });
    });
  }

  getAssetInfo(tk, asset_id){
    return this.apiService.getAssetInfo(asset_id).then((response) =>
      {
        var tokenData: any = response;
        tokenData = tokenData.asset;
        tk.name = tokenData.params.name;
        tk.url = tokenData.params.url;
        tk['unit-name'] = tokenData.params['unit-name'];
        return tk;
      });
  }

  parseAndPushTransactionHistory(httpResponse){
    if(this.nextToken==""){
      this.historyList = [];
    };
    var responseToAny:any = httpResponse;
    this.nextToken = responseToAny['next-token'];
    responseToAny.transactions.forEach(item => {
      console.log(item);
      var txnHistory:TxnHistory;
      var d = new Date(0);
      d.setUTCSeconds(item['round-time']);
      var date:string = d.toLocaleString();
      var txnTypeToString:string = "";
      var isSent:boolean = false;
      var color:string = "";
      var icon:string = "";
      var id:string = item.id;
      var sender:string = item.sender;
      var fee:number = item.fee; 
    
      if(item['tx-type']=='pay'|| item['tx-type'] =='axfer'){
        if(item.sender==this.account_address){
          isSent = true;
          icon = "arrow-redo";
          color = "danger";
        }else{
          isSent = false;
          icon = "arrow-undo";
          color = "success";
        }
        console.log("item['tx-type']=='pay'",color);
      }else{
        isSent = false;
        icon = "reload-circle";
        color = "primary";
        console.log("item['tx-type']!='pay'",color);
      }
      switch(item['tx-type']) {
        case 'pay': 
        txnTypeToString = "Payment";
          break;
        case 'keyreg':
          txnTypeToString = "Key Registration"
          break;
        case 'acfg':
          txnTypeToString = "Asset Configuration";
          break;
        case 'axfer': 
          txnTypeToString = "Asset Transfer";
          break;
        case 'afrz':
          txnTypeToString = "Asset Freeze";
          break;
        case 'appl':
          txnTypeToString = "Application Call";
          break;
      }

      if(item['tx-type']=="axfer"){
        txnHistory = {
          id:id,
          sender:sender,
          fee:fee,
          receiver:item['asset-transfer-transaction'].receiver,
          amount:0,
          amountAxfer:item['asset-transfer-transaction'].amount,
          ['asset-id']:item['asset-transfer-transaction']['asset-id'],
          date:date,
          txnTypeToString:txnTypeToString,
          isSent:isSent,
          color:color,
          icon:icon,
          isAmountHidden: true,
          isReceiverHidden: false,
          isAssetIdHidden: false,
          isAssetAmountHidden: false,
          }
      }else if(item['tx-type']=="pay"){
        txnHistory = {
          id:id,
          sender:sender,
          fee:fee,
          receiver:item['payment-transaction'].receiver,
          amount:item['payment-transaction'].amount,
          amountAxfer:0,
          ['asset-id']:null,
          date:date,
          txnTypeToString:txnTypeToString,
          isSent:isSent,
          color:color,
          icon:icon,
          isAmountHidden: false,
          isReceiverHidden: false,
          isAssetIdHidden: true,
          isAssetAmountHidden: true,
          }
      }else{
        txnHistory = {
          id:id,
          sender:sender,
          fee:fee,
          receiver:null,
          amount:0,
          amountAxfer:0,
          ['asset-id']:null,
          date:date,
          txnTypeToString:txnTypeToString,
          isSent:isSent,
          color:color,
          icon:icon,
          isAmountHidden: true,
          isReceiverHidden: true,
          isAssetIdHidden: false,
          isAssetAmountHidden: true,
          }
      }
      console.log(txnHistory);
      this.historyList.push(txnHistory);
    });
    //만약 거래기록이 하나도 없으면 거래기록이 없다는 메세지 활성화
    //hidden=isHistoryExist를 활성화 한다.
    if(this.historyList.length==0){
      this.isHistoryExist = false;
    }else{
      this.isHistoryExist = true;
    }
  }

  async getTransactionHistory(address,next_token){
    this.apiService.getTransactionHistory(address,next_token).then((response) => {
      this.parseAndPushTransactionHistory(response);
    });
  }

  async getCoinTransactionHistory(address,txn_type,next_token){
    this.apiService.getCoinTransactionHistory(address,txn_type,next_token).then((response) => {
      this.parseAndPushTransactionHistory(response);
    });
  }

  async getSelectedTokenTransactionHistory(address,asset_id,next_token){
    this.apiService.getSelectedTokenTransactionHistory(address,asset_id,next_token).then((response) => {
      this.parseAndPushTransactionHistory(response);
    });
  }



}
