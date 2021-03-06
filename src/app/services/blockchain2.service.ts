import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse,HttpResponse } from '@angular/common/http';
import { Account } from '../models/account';
import { Token } from '../models/token';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { Http } from '@capacitor-community/http';
import { StorageService } from '../services/storage.service';
import { Network } from '../const/network';

//알고랜드 REST API 데이터 획득용

@Injectable({
  providedIn: 'root'
})

export class Blockchain2Service {
  //http요청은 플랫폼에 별로 다른 http 요청 라이브러리를 사용한다.
  //특히 안드로이드에서 cors에 대응하기 위해 플랫폼 api를 사용하는 라이브러리를 쓴다.
  algod_path = "";
  algod_token = "";
  indexer_path = "";
  indexer_token = "";
  httpOptions = {};
  constructor(
    private http: HttpClient,
    public platform: Platform,
    private storageService:StorageService,) {
    }

  setNetworkVariables(){
    return new Promise(resolve=>{
      this.getNetwork().then(response=>{
        var responseToAny:any = response;
        this.algod_path = responseToAny.algodIp;
        this.indexer_path = responseToAny.indexerIp;
        this.algod_token = responseToAny.algodToken;
        this.indexer_token = responseToAny.indexerToken;
        console.log(this.algod_token,"this.algod_token");
        this.httpOptions = {
        headers:{'Content-Type': 'application/json','x-api-key': this.algod_token},
        };
        return resolve(true);
      });
    });
  }

  getNetwork(){
    return new Promise(resolve=>{
        this.storageService.get("network").then(async response=>{
          var responseToAny:any = response;
          if(responseToAny!=null){
            var responseJson = JSON.parse(response);
            var network = responseJson.network; //{network : {algodIp:XXX,algodToken:xxx,indexerIp:xxx,indexerToken}}
            console.log("getNetwork",network);
            return resolve(network);
          }else{
               //만약 최초 사용자여서 network 저장 기록이 없다면
            //default로 생성해서 저장 후 다시 불러온다.
            var networkObj = Network.NETWORK_TYPE_TO_IP_MAP.TestNet;
            var networkValue = {network:networkObj,};
            var networkValueToString = JSON.stringify(networkValue); //스트링변환해서 저장
            await this.storageService.set("network",networkValueToString);
            this.storageService.get("network").then(async response=>{
              var responseJson = JSON.parse(response);
              var network = responseJson.network; //{network : {algodIp:XXX,algodToken:xxx,indexerIp:xxx,indexerToken}}
              console.log("getNetwork",network);
              return resolve(network);
            });
          };
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


  
  //Account 정보 가져오기. 보유한 자산, 계정잔고 등
  getAccountInfo = async(address) => {
    if(this.platform.is('capacitor')){
    var options = {
      url: this.indexer_path + '/v2/accounts/' + address,
      headers: { 'Content-Type': 'application/json',
      'x-api-key': this.indexer_token },
      params: { },
    };
    return Http.request({ ...options, method: 'GET' }).then((response)=>{
      return response.data;
    });
  }else{
    return await this.http
    .get(this.indexer_path + '/v2/accounts/' + address, this.httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    ).toPromise();
  }
}

  //트랜잭션 파라미터 가져오기
  //거래 수수료 계산 사용
  getTxnParam = async() => {
    console.log(this.algod_path,"this.algod_path");
    if(this.platform.is('capacitor')){
      var options = {
        url: this.algod_path + '/v2/transactions/params',
        headers: { 'Content-Type': 'application/json',
        'x-api-key': this.algod_token, },
        params: { },
      };
      return Http.request({ ...options, method: 'GET' }).then((response)=>{
        return response.data;
      });
    }else{
      return await this.http
      .get(this.algod_path + '/v2/transactions/params', this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      ).toPromise();
    }
  };

  getAssetInfo = async(assetId) => {
    if(this.platform.is('capacitor')){
      var options = {
        url: this.indexer_path + '/v2/assets/' + assetId,
        headers: { 'Content-Type': 'application/json',
        'x-api-key': this.indexer_token,},
        params: { },
      };
      return Http.request({ ...options, method: 'GET' }).then((response)=>{
        return response.data;
      });
    }else{
      console.log(this.httpOptions,"httpOptions");
      return this.http
      .get(this.indexer_path + '/v2/assets/' + assetId, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      ).toPromise();
    }
  }

  

  getAddressAssetInfo = async(address,assetId) => {
    if(this.platform.is('capacitor')){
      var options = {
        url: this.algod_path + '/v2/accounts/' + address + '/assets/'+assetId,
        headers: { 'Content-Type': 'application/json',
        'x-api-key': this.algod_token,},
        params: { },
      };
      return Http.request({ ...options, method: 'GET' }).then((response)=>{
        return response.data;
      });
    }else{
      return await this.http
      .get(this.algod_path + '/v2/accounts/' + address + '/assets/'+assetId, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      ).toPromise();
    }
  }

  getNFTMetaData = async(url) => {
    if(this.platform.is('capacitor')){
      var stringArr = url.split(':');
      var ipftPath = stringArr[1].substring(1);
      var options = {
        url: 'https://ipfs.io/ipfs' + ipftPath,
        headers: { 'Content-Type': 'application/json'},
        params: { },
      };
      return Http.request({ ...options, method: 'GET' }).then((response)=>{
        return response.data;
      });
    }else{
      var stringArr = url.split(':');
      var ipftPath = stringArr[1].substring(1);
      return await this.http
        .get('https://ipfs.io/ipfs' + ipftPath)
       .pipe(
          retry(2),
         catchError(this.handleError)
       ).toPromise();
    }
  }

  //특정 주소의 모든 거래기록을 가져온다.
  //limit와 next param을 통해 나누어서 가져온다.
  //요청을하면 next 토큰을 반환하여 다음 요청시 넘겨주면 다음 목록을 요청할수 있다. (무한 스크롤에 사용)
  getTransactionHistory = async(address,next_token)=>{
    if(this.platform.is('capacitor')){
      var options = {
        url: this.indexer_path + '/v2/accounts/' + address + '/transactions',
        headers: { 'Content-Type': 'application/json',
        'x-api-key':this.indexer_token, },
        params: { 'limit': '20','next':next_token},
      };
      return Http.request({ ...options, method: 'GET' }).then((response)=>{
        console.log(response);
        return response.data;
      });
    }else{
      console.log(this.indexer_path + '/v2/accounts/' + address + '/transactions');
      return await this.http
      .get(this.indexer_path + '/v2/accounts/' + address + '/transactions',
       {
        headers: {'Content-Type': 'application/json',
        'x-api-key':this.indexer_token,},
        params : {'limit': 20,'next':next_token}
      })
      .pipe(
        retry(2),
        catchError(this.handleError)
      ).toPromise();
    }
  }

  //선택한 토큰의 거래 기록만 가져온다.
  //asset-id param추가
  //indexer사용
  getSelectedTokenTransactionHistory = async(address,asset_id,next_token)=>{
    if(this.platform.is('capacitor')){
      var options = {
        url: this.indexer_path + '/v2/accounts/' + address + '/transactions',
        headers: { 'Content-Type': 'application/json',
        'x-api-key':this.indexer_token,},
        params: { 'limit': '20','asset-id': asset_id.toString(),'next':next_token },
      };
      return Http.request({ ...options, method: 'GET' }).then((response)=>{
        return response.data;
      });
    }else{
      console.log(this.indexer_path + '/v2/accounts/' + address + '/transactions');
      return await this.http
      .get(this.indexer_path + '/v2/accounts/' + address + '/transactions',
       {
        headers: new HttpHeaders({'Content-Type': 'application/json',
        'x-api-key':this.indexer_token,
        }),
        params : {'limit': 20,'asset-id': asset_id,'next':next_token }
      })
      .pipe(
        retry(2),
        catchError(this.handleError)
      ).toPromise();
    }
  }

  //코인(암호화폐) 거래 기록만 가져온다.
  //tx-type param추가
  //indexer사용
  getCoinTransactionHistory = async(address,txn_type,next_token)=>{
    if(this.platform.is('capacitor')){
      var options = {
        url: this.indexer_path + '/v2/accounts/' + address + '/transactions',
        headers: { 'Content-Type': 'application/json',
        'x-api-key':this.indexer_token,},
        params: { 'limit': '20','tx-type': txn_type,'next':next_token },
      };
      return Http.request({ ...options, method: 'GET' }).then((response)=>{
        return response.data;
      });
    }else{
      console.log(this.indexer_path + '/v2/accounts/' + address + '/transactions');
      return await this.http
      .get(this.indexer_path + '/v2/accounts/' + address + '/transactions',
       {
        headers: new HttpHeaders({'Content-Type': 'application/json',
        'x-api-key':this.indexer_token,}),
        params : {'limit': 20,'tx-type': txn_type,'next':next_token }
      })
      .pipe(
        retry(2),
        catchError(this.handleError)
      ).toPromise();
    }
  }

}