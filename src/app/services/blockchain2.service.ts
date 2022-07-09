import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse,HttpResponse } from '@angular/common/http';
import { Account } from '../models/account';
import { Token } from '../models/token';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
// import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { Platform } from '@ionic/angular';
import { Http } from '@capacitor-community/http';


@Injectable({
  providedIn: 'root'
})
export class Blockchain2Service {
  base_path = "";
  constructor(
    private http: HttpClient,
     public platform: Platform) {    
      if (this.platform.is('capacitor')) {
        this.base_path = 'http://10.0.2.2:8080';
      } else {
        this.base_path = 'http://localhost:8080';
      }
    }

  // Http Options
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Algo-API-Token': '158a0082b552fe50d446f53329c972985de0c4ae43d5b2fd1bebc443b077cf59'
    })
  }

  // Handle API errors
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

  // Example of a GET request
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
        headers: { 'Content-Type': 'application/json',
        'X-Algo-API-Token': '158a0082b552fe50d446f53329c972985de0c4ae43d5b2fd1bebc443b077cf59' },
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
}