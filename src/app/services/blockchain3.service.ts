import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse,HttpResponse } from '@angular/common/http';
import { Account } from '../models/account';
import { Token } from '../models/token';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { Http } from '@capacitor-community/http';
import * as algosdk  from 'algosdk';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { File } from '@ionic-native/file/ngx';

@Injectable({
  providedIn: 'root'
})
export class Blockchain3Service {
  base_path = "";
  constructor(
    private file:File,
    private fileOpener: FileOpener,
    private http: HttpClient,
    public platform: Platform) {    
      if ( this.platform.is('capacitor') ) {
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

  getAccount = async(mnemonic) => {
    return new Promise((resolve)=>{
      let account = algosdk.mnemonicToSecretKey(mnemonic);
      console.log(account);
      return resolve(account);
    })
  }

  //실제 배포하면 algod서버가 원격에 있는데, 이 경우 cors error 발생??
  getConnection = async()=> {
    return new Promise(async(resolve)=>{
      var configJsonUnknown = await this.getConfigJson();
      var configJson:any = configJsonUnknown;
      var token = configJson.SmartContractParams.token;
      var ip_address = "";
      if(this.platform.is('capacitor')){
        ip_address = configJson.SmartContractParams.ip_address_android;
      }else{
        ip_address = configJson.SmartContractParams.ip_address;
      }
      var port = configJson.SmartContractParams.port;
      const algodToken = token;
      const algodServer = ip_address;
      const algodPort = Number(port);
      let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
      return resolve(algodClient);
    })
  }


  public getMinFee = async()=> {
    return new Promise(async(resolve)=>{
      var algodClient = await this.getConnection();
      var params = algosdk.ALGORAND_MIN_TX_FEE;
      return resolve(params);
    })
  }

  txnToByte = async(from_mnemonic:string,to_address:string,token_id:number,sent_amount:number) =>  {
    return new Promise(async(resolve)=>{
      var configJsonUnknown = await this.getConfigJson();
      var configJson:any = configJsonUnknown;
      //보내는 사람 개인키 가져와서 서명하기
      var devMnemonic = configJson.SmartContractParams.dev_mnemonic;
      type Account = {
        [key:string] : any
      }
      var account:Account = await this.getAccount(devMnemonic);
      var devPK = account.sk; //config파일에 비밀키가 있는데 니모닉을 통해서 가져오는 이유는, flask로 넘격던 다른 함수와 달리 
      //이 경우에는 backend에서 바로 서명해야 하기 때문에 uint로 인코딩된 값을 그대로 가져와서 서명으로 추가함.
      var sender = account.addr;
      var revocationTarget = undefined; //undefinde로 되어 있어야 이 변수에 실주소가 있는지 없는지 검증하지 않는다.
      var closeRemainderTo = undefined; //undefinde로 되어 있어야 이 변수에 실주소가 있는지 없는지 검증하지 않는다.
      var algodClientUnknown = await this.getConnection();
      var algodClient:any = algodClientUnknown;
      type Params = {
        [key:string]:any;
      }
      var paramsUnknown = await algodClient.getTransactionParams().do();
      var params:any = paramsUnknown;
      params.fee = algosdk.ALGORAND_MIN_TX_FEE;
      params.flatFee =  true;
      var receiver = to_address;
      var enc = new TextEncoder();
      var note = enc.encode("Hello World");
      var amount = sent_amount;
      var tokenID = token_id;
      console.log(tokenID);
      var xtxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
          sender, 
          receiver,
          closeRemainderTo, 
          revocationTarget,
          amount,  
          note, 
          tokenID, 
          params);
      var rawSignedTxn = xtxn.signTxn(devPK);
      var txId = xtxn.txID().toString();
      console.log("Signed transaction with txID: %s", txId);
      var pay_txn_bytes = algosdk.encodeObj(xtxn.get_obj_for_encoding());
      return resolve(pay_txn_bytes.length);
    })
  }


  sendTxn = async (from_mnemonic,to_address,token_id,sent_amount) => {
    return new Promise(async(resolve)=>{
      var configJsonUnknown = await this.getConfigJson();
      var configJson:any = configJsonUnknown;
      //보내는 사람 개인키 가져와서 서명하기
      var devMnemonic = configJson.SmartContractParams.dev_mnemonic;
      type Account = {
        [key:string] : any
      }
      var account:Account = await this.getAccount(devMnemonic);
      var devPK = account.sk; //config파일에 비밀키가 있는데 니모닉을 통해서 가져오는 이유는, flask로 넘격던 다른 함수와 달리 
      //이 경우에는 backend에서 바로 서명해야 하기 때문에 uint로 인코딩된 값을 그대로 가져와서 서명으로 추가함.
      var sender = account.addr;
      var revocationTarget = undefined; //undefinde로 되어 있어야 이 변수에 실주소가 있는지 없는지 검증하지 않는다.
      var closeRemainderTo = undefined; //undefinde로 되어 있어야 이 변수에 실주소가 있는지 없는지 검증하지 않는다.
      var algodClientUnknown = await this.getConnection();
      var algodClient:any = algodClientUnknown;
      type Params = {
        [key:string]:any;
      }
      var paramsUnknown = await algodClient.getTransactionParams().do();
      var params:any = paramsUnknown;
      params.fee = algosdk.ALGORAND_MIN_TX_FEE;
      params.flatFee =  true;
      var receiver = to_address;
      var enc = new TextEncoder();
      var note = enc.encode("Hello World");
      var amount = sent_amount;
      var tokenID = token_id;
      console.log(tokenID);
      var xtxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
          sender, 
          receiver,
          closeRemainderTo, 
          revocationTarget,
          amount,  
          note, 
          tokenID, 
          params);
    var rawSignedTxn = xtxn.signTxn(devPK);
    var txId = xtxn.txID().toString();
    var xtx = await algodClient.sendRawTransaction(rawSignedTxn).do();
    var confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
    var string = new TextDecoder().decode(confirmedTxn.txn.txn.note);
    var accountInfo = await algodClient.accountInformation(sender).do();
    var accountInfo = await algodClient.accountInformation(receiver).do();
    var result = txId;
    return resolve(result);
  })
}

  getConfigJson = async() =>  {
    if(this.platform.is('capacitor')){
      return this.file.checkDir(this.file.applicationDirectory, 'public/assets/')
      .then(_ => {
        console.log('Directory exists',this.file.applicationDirectory);
          return this.file.checkFile(this.file.applicationDirectory+'public/assets/', "config.json")
          .then(_ => {
            if(_){
              return this.file.copyFile(this.file.applicationDirectory+'public/assets/', "config.json", this.file.dataDirectory, "config.json")
                .then((result) => {
                 var rs = JSON.stringify(result)
                //  console.log("copy result"+result.nativeURL);
                 return Filesystem.readFile({   
                    path: result.nativeURL,
                 }).then(contents => {
                   var contentString = JSON.stringify(contents);
                   var contentJson = JSON.parse(contentString);
                   var contentJsonData = contentJson.data;
                   var contentDecode = atob(contentJsonData);
                   var contentDecodeJson = JSON.parse(contentDecode);
                   return contentDecodeJson;
                 }).catch(e=>{
                   console.log("Err",JSON.stringify(e));
                  })
                });
              }
            }).catch((e) => {
           console.log('error '+ JSON.stringify(e)); 
        });
      })
      .catch(err => {
        console.log('Directory doesn\'t exist',this.file.applicationDirectory)
        let filePath = this.file.applicationDirectory + 'public/assets/';
        let fakeName = Date.now();
        this.file.copyFile(filePath, "config.json", this.file.dataDirectory, "config.json").then(result => {
            this.fileOpener.open(result.nativeURL, 'application/json');
        });
        }
      );
    }else{
      return this.http
      .get('../../assets/config.json')
      .pipe(
        retry(2),
        catchError(this.handleError)
      ).toPromise();
    }
  }
}
