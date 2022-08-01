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
import { PortfolioNetwork } from '../../const/portfolio-network';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.page.html',
  styleUrls: ['./portfolio.page.scss'],
})
export class PortfolioPage implements OnInit {
  @ViewChild('chart', {static: true}) chart;
  
  networkSelected:string;
  isNetworkTestNet:boolean=true;
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
    this.getSelectedNetwork();
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
            // 'rgba(253,120,79,255)',
            'rgba(224,182,62,255)',
            // 'rgba(177,237,101,255)',
            'rgba(90,244,110,255)',
            // 'rgba(48,222,163,255)',
            'rgba(46,172,213,255)',
            // 'rgba(78,113,215,255)',
            'rgba(109,69,168,255)',
            // 'rgba(189,66,173,255)',
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

  replaceChartData(chart, label, data) {
    var index = chart.data.labels.indexOf(label);
    // console.log(chart.data.labels,"chart.data.labels");
    chart.data.datasets.forEach((dataset) => {
        dataset.data[index] = data;
        console.log(dataset.data,"dataset.data");
    });
    chart.update();
  }

  getSelectedNetwork(){
    this.storageService.get("portfolioNetwork").then(response=>{
      console.log(response);
      var responseJson = JSON.parse(response);
      this.networkSelected = responseJson.network.networkName;
      if(this.networkSelected=="TestNet"){
        this.isNetworkTestNet=true;
      }else{
        this.isNetworkTestNet=false;
      }
    });
  }

  selectNetworkChange(e) {
    this.selectNetwork(e.detail.value);
   }

   //선택한 Network명으로 ip주를 mapping하여서 가져온다.
  async selectNetwork(networkName){
    var networkObj;
    if(networkName == 'MainNet'){
      networkObj = PortfolioNetwork.NETWORK_TYPE_TO_IP_MAP.MainNet;
    }else if(networkName == 'TestNet'){
      networkObj = PortfolioNetwork.NETWORK_TYPE_TO_IP_MAP.TestNet;
    }
    var networkValue = {network:networkObj,};
    var networkValueToString = JSON.stringify(networkValue); //스트링변환해서 저장
    await this.storageService.set("portfolioNetwork",networkValueToString);
    await this.blockchainApisService.setNetworkVariables();
    // window.location.reload();
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
            this.updatePortfolioAccountsWithAmount(network,accounts);
          };
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

  goToSendCoinsPage(network,address,id){
    var state={};
    var destination="";
    if(network=="algorand"){
      state={
        txnParams:{
          sender: address,
        },
      };
      destination = "/send";
    }else{
      state={
        txnParams:{
          sender_id:id,
          sender: address,
          network: network,
        },
      };
      destination = "/send-coins";
    }
    const navigationExtras: NavigationExtras = {
     state:state,
    };
    this.router.navigateByUrl(destination,navigationExtras);
  }


  createNewAccount(network){
    this.blockchainApisService.createAccount(network).then(response=>{
      var responseToAny:any = response;
      var address;
      var privateKey;
      var id=null;
      if(network=="bitcoin"||network=="litecoin"){
        address = responseToAny.payload.name;
        id = responseToAny.payload.id;
        privateKey = responseToAny.payload.wif;
      }else{
        address = responseToAny.payload.address;
        privateKey = responseToAny.payload.privateKey;
      }
      var account = {address:address, privateKey:privateKey, id:id};
      //list에 push한 후 저장한다.
      if(this.portfolioAccounts.length>0){
        var index=null;
        for(var i=0; i<this.portfolioAccounts.length; i++){
          if(this.portfolioAccounts[i].network==network){
            index=i;
          }else{
          };
        };
        if(index!=null){
          //기존 네트워크에 계정이 이미 존재할 경우
          this.portfolioAccounts[index].accounts.push(account);
          this.setAccountInfo(this.portfolioAccounts);
          this.updatePortfolioAccountsWithAmount(network,this.portfolioAccounts[index].accounts);
        }else{
          var accountList = [];
          accountList.push(account);
          var portfolioAccount = {network:network,accounts:accountList};
          this.portfolioAccounts.push(portfolioAccount);
          this.setAccountInfo(this.portfolioAccounts);
          this.updatePortfolioAccountsWithAmount(network,accountList);
        }
      }else{
        //최초 생성의 경우
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
    console.log("accountList",accountList);
    var networkInfo:any = await this.blockchainApisService.getNetworkAPIInfo(network);
    var coin = networkInfo.networkDefine;
    var smallestUnit = networkInfo.smallestUnit;
    var marketUnit = networkInfo.marketUnit;
    var marketConversion = networkInfo.marketConversion;
    var accountWithAmountList = [];
    var subSum = 0;
    for(var i=0; i<accountList.length; i++){
      var addr = accountList[i].address;
      var id = accountList[i].id;
      console.log(i,accountList[i].address)
      var balance:any = 0;
      var balanceToString = 0;
      var accountWithAmount = {address:addr,id:id,balance:balance,balanceToCurrency:balanceToString};
      accountWithAmountList.push(accountWithAmount);
      try{
        if(network=="algorand"){
          var accountData:any = await this.apiService.getAccountInfo(addr);
          var accountAmount:number = accountData.account.amount;
          var marketBalance = accountAmount*marketConversion;
          accountWithAmountList[i].balance = marketBalance;
        }else{
          var accountData:any;
          if(network=="bitcoin"||network=="litecoin"){
            accountData = await this.getAccountBalance(network,accountList[i].id);
          }else{
            accountData = await this.getAccountBalance(network,addr);
          }
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
    //만약 동일 네트워크가 목록에 있을 경우
    console.log(this.portfolioAccountsWithAmount.length,"this.portfolioAccountsWithAmount.length");
    if(this.portfolioAccountsWithAmount.length>0){
      var index = null;
      for(var i=0; i<this.portfolioAccountsWithAmount.length; i++){
        if(this.portfolioAccountsWithAmount[i].network == network){
          index = i;
        }else{
          continue;
        };
      };
      if (index!=null) {
        this.portfolioAccountsWithAmount[index].accounts = accountWithAmountList;
        this.replaceChartData(this.doughnut,network,subSum);
      }else{
        var portfolioAccountWithAmount = {network:network,marketUnit:marketUnit,accounts:accountWithAmountList};
        this.portfolioAccountsWithAmount.push(portfolioAccountWithAmount);
        this.updateChart(this.doughnut,network,subSum);
      }
    }else{
      var portfolioAccountWithAmount = {network:network,marketUnit:marketUnit,accounts:accountWithAmountList};
      this.portfolioAccountsWithAmount.push(portfolioAccountWithAmount);
      this.updateChart(this.doughnut,network,subSum);
    }
    // this.subSumByNetworkList.push(subSum);
    // this.nameByNetworkList.push(network);

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
          label: 'Bitcoin[Mainnet only]',
          type: 'radio',
          value: 'bitcoin',
          disabled : this.isNetworkTestNet,
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
