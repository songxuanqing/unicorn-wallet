import { Component, OnInit } from '@angular/core';
import { Blockchain2Service } from '../../services/blockchain2.service';
import { Blockchain3Service } from '../../services/blockchain3.service';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { TxnHistory } from '../../models/txn-history';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  public account_address= "";
  public historyList:Array<TxnHistory> = [];

  constructor(private router:Router,
    private route:ActivatedRoute,
    private apiService: Blockchain2Service,
    private blockchainSDKService: Blockchain3Service) { 


    }

  ngOnInit() {
    const routerState = this.router.getCurrentNavigation().extras.state;
    console.log(routerState);
    this.account_address = routerState.txnParams.sender;
    this.getTransactionHistory(this.account_address);
  }

  getTransactionHistory(address){
    this.apiService.getTransactionHistory(address).then((response) => {
      console.log(response);
      var responseToAy:any = response;
      responseToAy.transactions.forEach(item => {
        console.log(item);
        var txnHistory:TxnHistory;
        var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
        d.setUTCSeconds(item['round-time']);
        var date:string = d.toString();
        var txnTypeToString:string = "";
        var isSent:boolean = false;
        var color:string = "";
        var icon:string = "";
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
            id:item.id,
            ['confirmed-round']:item['confirmed-round'],
            ['first-valid']:item['first-valid'],
            ['last-valid']:item['last-valid'],
            sender:item.sender,
            fee:item.fee,
            ['tx-type']:item['tx-type'],
            ['genesis-hash']:item['genesis-hash'],
            ['round-time']:item['round-time'],
            receiver:item['asset-transfer-transaction'].receiver,
            amount:0,
            amountAxfer:item['asset-transfer-transaction'].amount,
            ['asset-id']:item['asset-transfer-transaction']['asset-id'],
            date:date,
            txnTypeToString:txnTypeToString,
            isSent:isSent,
            color:color,
            icon:icon,
            }
        }else if(item['tx-type']=="pay"){
          txnHistory = {
            id:item.id,
            ['confirmed-round']:item['confirmed-round'],
            ['first-valid']:item['first-valid'],
            ['last-valid']:item['last-valid'],
            sender:item.sender,
            fee:item.fee,
            ['tx-type']:item['tx-type'],
            ['genesis-hash']:item['genesis-hash'],
            ['round-time']:item['round-time'],
            receiver:item['payment-transaction'].receiver,
            amount:item['payment-transaction'].amount,
            amountAxfer:0,
            ['asset-id']:null,
            date:date,
            txnTypeToString:txnTypeToString,
            isSent:isSent,
            color:color,
            icon:icon,
            }
        }else{
          txnHistory = {
            id:item.id,
            ['confirmed-round']:item['confirmed-round'],
            ['first-valid']:item['first-valid'],
            ['last-valid']:item['last-valid'],
            sender:item.sender,
            fee:item.fee,
            ['tx-type']:item['tx-type'],
            ['genesis-hash']:item['genesis-hash'],
            ['round-time']:item['round-time'],
            receiver:null,
            amount:0,
            amountAxfer:0,
            ['asset-id']:null,
            date:date,
            txnTypeToString:txnTypeToString,
            isSent:isSent,
            color:color,
            icon:icon,
            }
        }
        console.log(txnHistory);
        this.historyList.push(txnHistory);
      });
    });
    
  }

}
