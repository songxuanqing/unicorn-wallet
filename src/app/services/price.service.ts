import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse,HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { Http } from '@capacitor-community/http';

@Injectable({
  providedIn: 'root'
})
export class PriceService {
  base_path = "https://api.coinstats.app/public/v1/coins/";
  constructor(private http: HttpClient,
    public platform: Platform) { }

  //요청하는 환율 기준 단가 가져와서 반환하기.
  async getUnitPriceWithCurrency(coin,currency:string){
      var queryParams = new URLSearchParams({
        currency:currency,
      });
      var url = this.base_path+coin+'?'+`${queryParams}`;
    if(this.platform.is('capacitor')){
      var options = {
        url: url,
        headers: { 'Content-Type': 'application/json'},
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

  // chrome extension 개발용 angular Http요청 위한 옵션
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
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
}
