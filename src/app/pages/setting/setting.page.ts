import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../../services/header.service';
import { StorageService } from '../../services/storage.service';
import getSymbolFromCurrency from 'currency-symbol-map';
import { Currency } from '../../const/currency';
import { Network } from '../../const/network';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { Blockchain2Service } from '../../services/blockchain2.service';
import { Blockchain3Service } from '../../services/blockchain3.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {
  currencyList:Array<string> = [];
  currencyWithDescriptionSelected:string;
  networkList:Array<string> = [];
  networkSelected:string;

  //지갑 page는 db에 저장된 설정 정보를 읽어온다. (통화, 언어)
  
  constructor(private storageService: StorageService,
    private router:Router,
    private route:ActivatedRoute,
    private header:HeaderService,
    private apiService: Blockchain2Service,
    private blockchainSDKService: Blockchain3Service,
    ) { }

  ngOnInit() {
    //저장된 통화 가져오기 및 통화목록 생성
    this.getSelectedCurrency();
    this.createCurrencyList();
    //저장된 네트워크 가져오기 및 네트워크 목록 생성
    this.getSelectedNetwork();
    this.createNetworkList();
  }

  //통화목록으로 가진 데이터(객체)를 가져와서 
  //해당 객체의 키값별로 value를 추출해서 value array 생성
  createCurrencyList(){
    var currencyClass = new Currency();
    var vals = Object.keys(currencyClass).map(key => currencyClass[key]);
    vals.forEach(item=>{
      this.currencyList.push(item);
    })
  }

  //db에서 과거에 선택했던 통화 가져오기
  getSelectedCurrency(){
    this.storageService.get("currency").then(response=>{
      var responseJson = JSON.parse(response);
      this.currencyWithDescriptionSelected = responseJson.currencyWithDescription;
    });
  }

  selectCurrencyChange(e) {
   this.selectCurrency(e.detail.value);
  }

  //선택한 통화는  USD - United State 형태로 되어있음.
  //대시 앞의 값을 바탕으로 통화 심볼 맵핑
  //선택한 통화명과 심볼을 DB에 저장
  selectCurrency(currencySelected){
    var currencyList = currencySelected.split("-");
    var currency = currencyList[0];
    var symbol = getSymbolFromCurrency(currency);
    var currencyValue = {currencyWithDescription:currencySelected, currency:currency, symbol:symbol};
    var currencyValueToString = JSON.stringify(currencyValue); //스트링변환해서 저장
    this.storageService.set("currency",currencyValueToString);
  }


  //네트워크목록으로 가진 데이터(객체)를 가져와서 
  //해당 객체의 키값별로 value를 추출해서 value array 생성
  createNetworkList(){
    var mainNet = Network.mainNet;
    var testNet = Network.testNet;
    var betaNet = Network.betaNet;
    this.networkList.push(mainNet);
    this.networkList.push(testNet);
    this.networkList.push(betaNet);
  }

  //db에서 과거에 선택했던 통화 가져오기
  getSelectedNetwork(){
    this.storageService.get("network").then(response=>{
      var responseJson = JSON.parse(response);
      this.networkSelected = responseJson.network.networkName;
    });
  }

  selectNetworkChange(e) {
   this.selectNetwork(e.detail.value);
  }

  //선택한 Network명으로 ip주를 mapping하여서 가져온다.
  async selectNetwork(networkName){
    var networkObj;
    if(networkName == 'MainNet'){
      networkObj = Network.NETWORK_TYPE_TO_IP_MAP.MainNet;
    }else if(networkName == 'TestNet'){
      networkObj = Network.NETWORK_TYPE_TO_IP_MAP.TestNet;
    }else if(networkName == 'BetaNet'){
      networkObj = Network.NETWORK_TYPE_TO_IP_MAP.BetaNet;
    }
    var networkValue = {network:networkObj,};
    var networkValueToString = JSON.stringify(networkValue); //스트링변환해서 저장
    await this.storageService.set("network",networkValueToString);
    await this.apiService.setNetworkVariables();
    await this.blockchainSDKService.setNetworkVariables();
  }

  //비밀번호 재설정 페이지 이동
  goToChangePasswordPage(){
    const navigationExtras: NavigationExtras = {
    };
    this.router.navigateByUrl('/change-pw',navigationExtras);
  }

}
