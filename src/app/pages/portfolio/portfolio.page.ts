import { Component, OnInit,ViewChild } from '@angular/core';
import { HeaderService } from '../../services/header.service';
import { BlockchainApisService } from '../../services/blockchain-apis.service';
import { AlertController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Chart, DoughnutController,ArcElement, PointElement, Legend,Title,Tooltip } from 'chart.js';
import { PriceService } from '../../services/price.service';
import { Blockchain2Service } from '../../services/blockchain2.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.page.html',
  styleUrls: ['./portfolio.page.scss'],
})
export class PortfolioPage implements OnInit {
  @ViewChild('chart', {static: true}) chart;
  
  doughnut: any;
  isBackFromTxn:boolean = false;
  portfolioAccounts:Array<any> = [];
  portfolioAccountsWithAmount:Array<any> = [];
  subSumByNetworkList = [];
  nameByNetworkList = [];
  currency = 'USD';
  symbol = '$';
  constructor(
    private router:Router,
    private route:ActivatedRoute,
    private alertController: AlertController,
    private apiService: Blockchain2Service,
    private blockchainApisService: BlockchainApisService,
    private storageService: StorageService,
    private header: HeaderService,
    private priceService:PriceService,
    public toastController: ToastController,
    ) { }

  ngOnInit() {
    this.getAccountList().then(response=>{
      this.createChart();
    });
    Chart.register(DoughnutController,ArcElement,PointElement, Legend,Title,Tooltip);
  }

  ionViewDidEnter(){
    console.log(history.state);
    if(history.state!=undefined){
      this.isBackFromTxn = history.state.txnParams.done;
      if(this.isBackFromTxn){
        this.presentToastWithOptions(history.state.txnParams.txnId);
      };
    };
    
  }

  createChart() {
    console.log(this.subSumByNetworkList,"this.subSumByNetworkList");
    this.doughnut = new Chart(this.chart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          label: 'portfolio',
          data: [],
          backgroundColor: [
            'rgba(251,78,132,255)',
            'rgba(253,120,79,255)',
            'rgba(224,182,62,255)',
            'rgba(177,237,101,255)',
            'rgba(90,244,110,255)',
            'rgba(48,222,163,255)',
            'rgba(46,172,213,255)',
            'rgba(78,113,215,255)',
            'rgba(109,69,168,255)',
            'rgba(189,66,173,255)',
          ],
          hoverOffset: 4
        }]
      },
    });
  }

  updateChart(chart, label, data) {
    chart.data.labels.push(label);
    console.log(chart.data.labels,"chart.data.labels");
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
        console.log(dataset.data,"dataset.data");
    });
    chart.update();
}


  changeNetwork(){
    //setPortfolioNetwork
  }

  getAccountList(){
    return new Promise (async resolve=>{
      await this.getSelectedCurrency();
      var network:any = "algorand";
      this.storageService.getDecryption("accounts",null).then(async(response)=>{
        var responseToAny:any = response;
        var accountList=[];
        for(var item of responseToAny){
          var account={address:item.addr};
          accountList.push(account);
        }
        this.updatePortfolioAccountsWithAmount(network,accountList);
      });
      this.storageService.getDecryption("portfolioAccounts",null).then(async(response)=>{
        var responseToAny:any = response;
        console.log("getAccountList()",responseToAny);
        if(responseToAny!=null){
          for(var i=0;i<responseToAny.length; i++){
            var item = responseToAny[i];
            this.portfolioAccounts.push(item);
            //UI용 balance취득 및 어레이 푸시
            var network = item.network;
            var accounts = item.accounts;
            console.log("getAccountList()",responseToAny);
          };
          this.updatePortfolioAccountsWithAmount(network,accounts);
        };
      }).catch(e=>{
        
      });
      resolve(true);
    });
  }

  getAccountBalance(network,address){
    return new Promise(resolve=>{
      this.blockchainApisService.getAccountBalance(network,address)
      .then(response=>{
        var responseToAny:any = response;
        var balance = responseToAny.payload.balance;
        return resolve(balance); 
      }).catch(e=>{
        return resolve(0);
      });
    });
  }

  //주어진 통화기준 알고랜드 단가 가져오기
  getUnitPriceWithCurrency(coin,currency){
    return new Promise(resolve=>{
      this.priceService.getUnitPriceWithCurrency(coin,currency).then(response=>{
        var responseToAny:any = response;
        var unitPrice = +responseToAny.coin.price;
        return resolve(unitPrice);
      });
    });
  }


  //db에서 과거에 선택했던 통화 가져오기
   getSelectedCurrency(){
    return new Promise(resolve=>{
        this.storageService.get("currency").then(response=>{
          var responseToAny:any = response;
          var responseJson = JSON.parse(response);
          this.currency = responseJson.currency;
          this.symbol = responseJson.symbol;
          return resolve(false);
        });
    });
  }

  goToSendCoinsPage(network,address){
    const navigationExtras: NavigationExtras = {
      state: {
        txnParams:{
          sender: address,
          network: network,
        },
      },
    };
    this.router.navigateByUrl('/send-coins',navigationExtras);
  }


  createNewAccount(network){
    this.blockchainApisService.createAccount(network).then(response=>{
      var responseToAny:any = response;
      var address = responseToAny.payload.address;
      var privateKey = responseToAny.payload.privateKey;
      var account = {address:address, privateKey:privateKey};
      //list에 push한 후 저장한다.
      if(this.portfolioAccounts.length>0){
        for(var i=0; i<this.portfolioAccounts.length; i++){
          var item = this.portfolioAccounts[i];
          if(item.network==network){
            //기존 네트워크에 계정이 이미 존재할 경우
            this.portfolioAccounts[i].accounts.push(account);
            // var index = this.portfolioAccounts.indexOf(item);
            // if (index !== -1) {
            //   this.portfolioAccounts[index] = newAccount;
            // }
          }else{
            var accountList = [];
            accountList.push(account);
            var portfolioAccount = {network:network,accounts:accountList};
            this.portfolioAccounts.push(portfolioAccount);
            this.setAccountInfo(this.portfolioAccounts);
            this.updatePortfolioAccountsWithAmount(network,accountList);
          };
        };
      }else{
        var accountList = [];
        accountList.push(account);
        var portfolioAccount = {network:network,accounts:accountList};
        this.portfolioAccounts.push(portfolioAccount);
        this.setAccountInfo(this.portfolioAccounts);
        this.updatePortfolioAccountsWithAmount(network,accountList);
      };
    });
  }

  async updatePortfolioAccountsWithAmount(network,accountList){
    var networkInfo:any = await this.blockchainApisService.getNetworkAPIInfo(network);
    var coin = networkInfo.networkDefine;
    var smallestUnit = networkInfo.smallestUnit;
    var marketUnit = networkInfo.marketUnit;
    var marketConversion = networkInfo.marketConversion;
    var accountWithAmountList = [];
    var subSum = 0;
    for(var i=0; i<accountList.length; i++){
      var addr = accountList[i].address;
      console.log(i,accountList[i].address)
      var balance:any = 0;
      var balanceToString = 0;
      var accountWithAmount = {address:addr,balance:balance,balanceToCurrency:balanceToString};
      accountWithAmountList.push(accountWithAmount);
      try{
        if(network=="algorand"){
          var accountData:any = await this.apiService.getAccountInfo(addr);
          var accountAmount:number = accountData.account.amount;
          var marketBalance = accountAmount*marketConversion;
          accountWithAmountList[i].balance = marketBalance;
        }else{
          var accountData:any = await this.getAccountBalance(network,addr);
          var accountAmount:number = accountData;
          var marketBalance = +accountAmount*marketConversion;
          accountWithAmountList[i].balance = marketBalance;
          console.log(accountWithAmountList[i].balance,"else");
        }
        var unitPrice = await this.getUnitPriceWithCurrency(coin,this.currency);
        var balanceToCurrency = accountWithAmountList[i].balance * +unitPrice;
        var balanceToCurrencyToString = balanceToCurrency.toString()
            .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        accountWithAmountList[i].balanceToCurrency = balanceToCurrencyToString;
        subSum=subSum+balanceToCurrency;
      }catch{
        continue;
      };
    };
    var portfolioAccountWithAmount = {network:network,marketUnit:marketUnit,accounts:accountWithAmountList};
    this.portfolioAccountsWithAmount.push(portfolioAccountWithAmount);
    this.subSumByNetworkList.push(subSum);
    this.nameByNetworkList.push(network);
    this.updateChart(this.doughnut,network,subSum);
  }

  async setAccountInfo(accounts){
    await this.storageService.setEncryption("portfolioAccounts",accounts, null);
  }


  async createNewAccountAlert() {
    const alert = await this.alertController.create({
      header: 'Create New Account',
      buttons: [
        {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {  }
        },
        {
        text: 'OK',
        role: 'confirm',
        handler: (input) => { 
          console.log("input",input);
          this.createNewAccount(input); }
        }
      ],
      inputs: [
        {
          label: 'Bitcoin',
          type: 'radio',
          value: 'bitcoin'
        },
        {
          label: 'Ethereum',
          type: 'radio',
          value: 'ethereum'
        },
        {
          label: 'Binance Smart Chain',
          type: 'radio',
          value: 'binance-coin'
        },
        {
          label: 'Klaytn',
          type: 'radio',
          value: 'klay-token'
        },
        {
          label: 'Avalanche C Chain',
          type: 'radio',
          value: 'avalanche-2'
        },
        {
          label: 'Litecoin',
          type: 'radio',
          value: 'litecoin'
        },
      ]
    });
    await alert.present();
  }


  async presentToastWithOptions(txnId) {
    const toast = await this.toastController.create({
      message: "Transaction Successfully Requested.\n"+" Txn ID : \n"+txnId.toString(),
      duration: 500,
      icon: 'information-circle',
      position: 'top',
      cssClass: 'toast-overflow',
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
