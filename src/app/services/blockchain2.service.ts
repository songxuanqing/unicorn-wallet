import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse,HttpResponse } from '@angular/common/http';
import { Account } from '../models/account';
import { Token } from '../models/token';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { Http } from '@capacitor-community/http';

//알고랜드 REST API 데이터 획득용

@Injectable({
  providedIn: 'root'
})

export class Blockchain2Service {
  //http요청은 플랫폼에 별로 다른 http 요청 라이브러리를 사용한다.
  //특히 안드로이드에서 cors에 대응하기 위해 플랫폼 api를 사용하는 라이브러리를 쓴다.
  base_path = "";
  indexer_path = "";
  constructor(
    private http: HttpClient,
     public platform: Platform) {
      //최종 배포시 url를 블록체인 노드 url로 바꿔야함.
      //특히 localhost는 heroku프록시 써야 할 수도 있음.
      if (this.platform.is('capacitor')) {
        this.base_path = "http://10.0.2.2:8080";
        this.indexer_path = "https://testnet-algorand.api.purestake.io/idx2";
      } else {
        this.base_path = 'http://localhost:8080';
        this.indexer_path = "https://testnet-algorand.api.purestake.io/idx2";
      }
    }

  // chrome extension 개발용 angular Http요청 위한 옵션
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Algo-API-Token': '158a0082b552fe50d446f53329c972985de0c4ae43d5b2fd1bebc443b077cf59'
    })
  }

  //chrome extension 개발용 angular Http요청 위한 api error 핸들링
  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };

  //트랜잭션 파라미터 가져오기
  //거래 수수료 계산 사용
  getTxnParam = async() => {
    if(this.platform.is('capacitor')){
      var options = {
        url: this.base_path + '/v2/transactions/params',
        headers: { 'Content-Type': 'application/json',
        'X-Algo-API-Token': '158a0082b552fe50d446f53329c972985de0c4ae43d5b2fd1bebc443b077cf59' },
        params: { },
      };
      return Http.request({ ...options, method: 'GET' }).then((response)=>{
        return response.data;
      });
    }else{
      return await this.http
      .get(this.base_path + '/v2/transactions/params', this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      ).toPromise();
    }
  };
  
  //Account 정보 가져오기. 보유한 자산, 계정잔고 등
  getAccountInfo = async(address) => {
    if(this.platform.is('capacitor')){
    var options = {
      url: this.base_path + '/v2/accounts/' + address,
      headers: { 'Content-Type': 'application/json',
      'X-Algo-API-Token': '158a0082b552fe50d446f53329c972985de0c4ae43d5b2fd1bebc443b077cf59' },
      params: { },
    };
    return Http.request({ ...options, method: 'GET' }).then((response)=>{
      return response.data;
    });
  }else{
    return await this.http
    .get(this.base_path + '/v2/accounts/' + address, this.httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    ).toPromise();
  }
}

  getAssetInfo = async(assetId) => {
    if(this.platform.is('capacitor')){
      var options = {
        url: this.base_path + '/v2/assets/' + assetId,
        headers: { 'Content-Type': 'application/json',
        'X-Algo-API-Token': '158a0082b552fe50d446f53329c972985de0c4ae43d5b2fd1bebc443b077cf59' },
        params: { },
      };
      return Http.request({ ...options, method: 'GET' }).then((response)=>{
        return response.data;
      });
    }else{
      return await this.http
      .get(this.base_path + '/v2/assets/' + assetId, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      ).toPromise();
    }
  }

  

  getAddressAssetInfo = async(address,assetId) => {
    if(this.platform.is('capacitor')){
      var options = {
        url: this.base_path + '/v2/accounts/' + address + '/assets/'+assetId,
        headers: { 'Content-Type': 'application/json',
        'X-Algo-API-Token': '158a0082b552fe50d446f53329c972985de0c4ae43d5b2fd1bebc443b077cf59' },
        params: { },
      };
      return Http.request({ ...options, method: 'GET' }).then((response)=>{
        return response.data;
      });
    }else{
      return await this.http
      .get(this.base_path + '/v2/accounts/' + address + '/assets/'+assetId, this.httpOptions)
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
        'x-api-key':'4LS0jVPkU61EBPpW2Ml3A2iaEcEfXK92aCDSzXXr'},
        params: { 'limit': '20','next':next_token},
      };
      return Http.request({ ...options, method: 'GET' }).then((response)=>{
        console.log(response);
        return response.data;
      });
    }else{
      return await this.http
      .get(this.indexer_path + '/v2/accounts/' + address + '/transactions',
       {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
         'x-api-key':'4LS0jVPkU61EBPpW2Ml3A2iaEcEfXK92aCDSzXXr'
        }),
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
        'x-api-key':'4LS0jVPkU61EBPpW2Ml3A2iaEcEfXK92aCDSzXXr'},
        params: { 'limit': '20','asset-id': asset_id.toString(),'next':next_token },
      };
      return Http.request({ ...options, method: 'GET' }).then((response)=>{
        return response.data;
      });
    }else{
      return await this.http
      .get(this.indexer_path + '/v2/accounts/' + address + '/transactions',
       {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
         'x-api-key':'4LS0jVPkU61EBPpW2Ml3A2iaEcEfXK92aCDSzXXr'
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
        'x-api-key':'4LS0jVPkU61EBPpW2Ml3A2iaEcEfXK92aCDSzXXr'},
        params: { 'limit': '20','tx-type': txn_type,'next':next_token },
      };
      return Http.request({ ...options, method: 'GET' }).then((response)=>{
        return response.data;
      });
    }else{
      return await this.http
      .get(this.indexer_path + '/v2/accounts/' + address + '/transactions',
       {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
         'x-api-key':'4LS0jVPkU61EBPpW2Ml3A2iaEcEfXK92aCDSzXXr'
        }),
        params : {'limit': 20,'tx-type': txn_type,'next':next_token }
      })
      .pipe(
        retry(2),
        catchError(this.handleError)
      ).toPromise();
    }
  }

}