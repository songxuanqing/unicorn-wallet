import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse,HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { Http } from '@capacitor-community/http';
import { StorageService } from '../services/storage.service';
import { PortfolioNetwork } from '../const/portfolio-network';
import { PortfolioSupportBlockchain } from '../const/portfolio-support-blockchain';

@Injectable({
  providedIn: 'root'
})
export class BlockchainApisService {

  //http요청은 플랫폼에 별로 다른 http 요청 라이브러리를 사용한다.
  //특히 안드로이드에서 cors에 대응하기 위해 플랫폼 api를 사용하는 라이브러리를 쓴다.
  base_path = "";
  api_version = "";
  base_token = "";
  httpOptions = {};
  constructor(
    private http: HttpClient,
    public platform: Platform,
    private storageService:StorageService,) {
    }
  //db에 저장된 최근 네트워크 정보 불러오기


  setNetworkVariables(){
    return new Promise(resolve=>{
      this.getNetwork().then(response=>{
        var responseToAny:any = response;
        this.base_path = responseToAny.baseIp;
        this.base_token = responseToAny.baseToken;
        this.httpOptions = {
        headers:{'Content-Type': 'application/json',
        'X-API-TOKEN': this.base_token},
        };
        return resolve(true);
      });
    });
  }


  getNetwork(){
    return new Promise(resolve=>{
        this.storageService.get("portfolioNetwork").then(async response=>{
          var responseToAny:any = response;
          if(responseToAny!=null){
            var responseJson = JSON.parse(response);
            var network = responseJson.network;
            console.log("getNetwork",network);
            return resolve(network);
          }else{
            //만약 최초 사용자여서 network 저장 기록이 없다면
            //default로 생성해서 저장 후 다시 불러온다.
            var networkObj = PortfolioNetwork.NETWORK_TYPE_TO_IP_MAP.TestNet;
            var networkValue = {network:networkObj,};
            var networkValueToString = JSON.stringify(networkValue); //스트링변환해서 저장
            await this.storageService.set("portfolioNetwork",networkValueToString);
            this.storageService.get("portfolioNetwork").then(async response=>{
              var responseJson = JSON.parse(response);
              var network = responseJson.network;
              console.log("getNetwork",network);
              return resolve(network);
            });
          }
        });
    });
  } 

    //chrome extension 개발용 angular Http요청 위한 api error 핸들링
    handleError(error: HttpErrorResponse) {
      if (error.error instanceof ErrorEvent) {
        console.error('An error occurred:', error.error.message);
      } else {
        console.error(
          'Backend returned code %o',error,
          `body was: ${error.message}`);
      }
      return throwError(
        'Something bad happened; please try again later.');
    };

  
  //Account 생성하기
  createAccount = async(network) => {
    var networkInfo:any = await this.getNetworkAPIInfo(network);
    var version = networkInfo.apiVersion;
    var networkShort = networkInfo.networkShort;

    var v2Ip;
    if(version=="v2"){
      var networkObj = PortfolioNetwork.NETWORK_TYPE_TO_IP_MAP[version];
      v2Ip = networkObj.baseIp;
    }

    var url;
    var base_path;
    if(network=="bitcoin"||network=="litecoin"){
      base_path = v2Ip;
      url = base_path + '/'+version+'/'+networkShort+"/wallets/hd?api_token="+this.base_token;;
    }else{
      base_path = this.base_path;
      url = base_path + '/'+version+'/'+networkShort+'/address?api_token='+this.base_token;
    }
    if(this.platform.is('capacitor')){
    var options = {
      url: url,
      headers: { 'Content-Type': 'application/json',
      'X-API-TOKEN': this.base_token },
    };
    return Http.request({ ...options, method: 'POST' }).then((response)=>{
      return response.data;
    });
  }else{
    return await this.http
    .post(url, this.httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    ).toPromise();
  };
}  

  //Account balance 정보 가져오기.
  getAccountBalance = async(network,address) => {
    var networkInfo:any = await this.getNetworkAPIInfo(network);
    var version = networkInfo.apiVersion;
    var networkShort = networkInfo.networkShort;

    var v2Ip;
    if(version=="v2"){
      var networkObj = PortfolioNetwork.NETWORK_TYPE_TO_IP_MAP[version];
      v2Ip = networkObj.baseIp;
    }
  
    var url;
    var base_path;
    if(network=="bitcoin"||network=="litecoin"){
      base_path = v2Ip;
      url = base_path + '/'+version+'/'+networkShort+'/wallets/' + address+'/balance?api_token='+this.base_token;
    }else{
      base_path = this.base_path;
      url = base_path + '/'+version+'/'+networkShort+'/address/' + address+'/balance?api_token='+this.base_token;
    }
    if(this.platform.is('capacitor')){
    var options = {
      url: url,
      headers: { 'Content-Type': 'application/json',
      'X-API-TOKEN': this.base_token },
      params: { },
    };
    return Http.request({ ...options, method: 'GET' }).then((response)=>{
      return response.data;
    });
  }else{
    return await this.http
    .get(url, this.httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    ).toPromise();
  }
}

  //send Txn
  sendTxn = async(network,from,to,amount)=>{
    var networkInfo:any = await this.getNetworkAPIInfo(network);
    var version = networkInfo.apiVersion;
    var networkShort = networkInfo.networkShort;

    var privateKey = await this.getPrivateKey(network,from);
    //v3용 formdata
    var formData: any = new FormData();
    formData.append("private_key", privateKey.toString());
    formData.append("to", to.toString());
    formData.append("amount", amount.toString());
    console.log("form",formData.getAll("private_key"));
    //v2용 rawdata
    var rawData = {
      "wif" : privateKey.toString(),
      "address" : to.toString(),
      "amount" : amount,
    }
    var bodyData;
     
    var v2Ip;
    if(version=="v2"){
      var networkObj = PortfolioNetwork.NETWORK_TYPE_TO_IP_MAP[version];
      v2Ip = networkObj.baseIp;
    }

    var url;
    var base_path;

    if(network=="bitcoin"||network=="litecoin"){
      bodyData = rawData;
      base_path = v2Ip;
      url = base_path + '/'+version+'/'+networkShort+'/wallets/' + from+'/sendtoaddress?api_token='+this.base_token;
    }else{
      bodyData=formData;
      base_path = this.base_path;
      url = base_path = + '/'+version+'/'+networkShort+'/address/' + from+'/send?api_token='+this.base_token;
    };
    if(this.platform.is('capacitor')){
      var options = {
        url: url,
        headers: { 'Content-Type': 'application/json',
        'X-API-TOKEN': this.base_token },
        data: bodyData,
      };
      return Http.request({ ...options, method: 'POST' }).then((response)=>{
        return response.data;
      });
    }else{
      return await this.http
      .post(url, bodyData)
      .pipe(
        retry(2),
        catchError(this.handleError)
      ).toPromise();
    };
  }


  //db에 저장된 private key가져오기
  getPrivateKey(network,address){
    return new Promise(resolve=>{
      this.storageService.getDecryption("portfolioAccounts",null).then(async response=>{
        var responseToAny:any = response;
        if(responseToAny==null){
          
        };
        //array [{network:bitcoin,
        //        accounts:[{addr:,privateKey:,...},A,B,C...]},
        //        {network:ethereum, 
        //        accounts[{addr,privateKey,...},A,B,C]},A,B,C...]
        var privateKey = "";
        responseToAny.every(item=>{
          if(network==item.network){
            item.accounts.every(account=>{
              if(address==account.address){
                privateKey = account.privateKey;
                return false;
              }else{
                return true;
              }
            });
            return false;
          }else{
            return true;
          };
        });
        return resolve(privateKey);
      });
    });
  }

  //네트워크 정보 저장하기
  //사용자가 네트워크 정보를 변경하면 저장(아래함수) 호출 후 setNetworkVariables() 호출
  async setNetwork(network){
    return new Promise(async resolve=>{
      var networkObj = PortfolioNetwork.NETWORK_TYPE_TO_IP_MAP[network];
      var networkValue = {network:networkObj,};
      var networkValueToString = JSON.stringify(networkValue); //스트링변환해서 저장
      await this.storageService.set("portfolioNetwork",networkValueToString);
      return resolve(true);
    });
  }

  //api호출 관련 정보 가져오기
  getNetworkAPIInfo(network){
    return new Promise(resolve=>{
      console.log(PortfolioSupportBlockchain.NETWORK_TYPE_TO_NAME_MAP[network],network);
      var networkObj = PortfolioSupportBlockchain.NETWORK_TYPE_TO_NAME_MAP[network];
      return resolve(networkObj);
    });
  }




}
