import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse,HttpResponse } from '@angular/common/http';
import { Account } from '../models/account';
import { Token } from '../models/token';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // API path
  base_path = '/novarand';

  constructor(private http: HttpClient) { }

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

  // Get account info by account's address
  public async getAccountInfo(address): Promise<any>  {
    return await this.http
      .get(this.base_path + '/v2/accounts/' + address, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      ).toPromise();
  }

  // Get asset info by asset-id
  public async getAssetInfo(assetId): Promise<any>  {
    return await this.http
      .get(this.base_path + '/v2/assets/' + assetId, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      ).toPromise();
  }

  
  // Get account information about a given asset.
  public async getAddressAssetInfo(address,assetId): Promise<any>  {
    return await this.http
      .get(this.base_path + '/v2/accounts/' + address + '/assets/'+assetId, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      ).toPromise();
  }


  // Get metadata
  public async getNFTMetaData(url): Promise<any>  {
    var stringArr = url.split(':');
    var ipftPath = stringArr[1].substring(1);
    return await this.http
      .get('https://ipfs.io/ipfs' + ipftPath)
      .pipe(
        retry(2),
        catchError(this.handleError)
      ).toPromise();
  }

    // Get parameters for constructing a new transaction including txn fee
    public async getTxnParam(): Promise<any>  {
      return await this.http
      .get(this.base_path + '/v2/transactions/params', this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      ).toPromise();
    }

}