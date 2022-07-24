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
import { StorageService } from './storage.service';
import { Network } from '../const/network';
import {Buffer} from 'buffer';

//알고랜드 SDK 연결 및 데이터 획득용

@Injectable({
  providedIn: 'root'
})

export class Blockchain3Service {
   //http요청은 플랫폼에 별로 다른 http 요청 라이브러리를 사용한다.
  //특히 안드로이드에서 cors에 대응하기 위해 플랫폼 api를 사용하는 라이브러리를 쓴다.
  algod_path = "";
  algod_token = "";
  indexer_path = "";
  indexer_token = "";
  httpOptions = {};
  constructor(
    private file: File,
    private fileOpener: FileOpener,
    private http: HttpClient,
    public platform: Platform,
    public storageService: StorageService) {   
      //base path 설정을 위해 db에 저장된 network정보 가져오기
    }

    setNetworkVariables(){
      return new Promise(resolve=>{
        this.getNetwork().then(response=>{
          var responseToAny:any = response;
          this.algod_path = responseToAny.algodIp;
          this.indexer_path = responseToAny.indexerIp;
          this.algod_token = responseToAny.algodToken;
          this.indexer_token = responseToAny.indexerToken;
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
            var responseJson = JSON.parse(response);
            if(Object.keys(responseJson).length > 0){
              var network = responseJson.network; //{network : {algodIp:XXX,algodToken:xxx,indexerIp:xxx,indexerToken}}
              return resolve(network);
            }else{
              //만약 최초 사용자여서 network 저장 기록이 없다면
              //default로 생성해서 저장 후 다시 불러온다.
              var networkObj = Network.NETWORK_TYPE_TO_IP_MAP.TestNet;
              var networkValue = {network:networkObj,};
              var networkValueToString = JSON.stringify(networkValue); //스트링변환해서 저장
              await this.storageService.set("network",networkValueToString);
              this.storageService.get("network").then(response=>{
              var responseJson = JSON.parse(response);
              var network = responseJson.network; //{network : {algodIp:XXX,algodToken:xxx,indexerIp:xxx,indexerToken}}
              console.log("getNetwork",network);
              return resolve(network);
            });
            };
          });
      });
    } 

//chrome extension 개발용, angular http요청  Handle API errors
handleError(error: HttpErrorResponse) {
  if (error.error instanceof ErrorEvent) {
    console.error('An error occurred: ', error.error.message);
  } else {
    console.error(
      'Backend returned code %o',error,
      `body was: ${error.message}`);
  }
  return throwError(
    'Something bad happened; please try again later.');
};

  //설정한 ip, port, 토큰으로 접속 client 객체 반환
  //실제 배포하면 algod서버가 원격에 있는데, 이 경우 cors error 발생??
  getConnection = async()=> {
    return new Promise(async(resolve)=>{
      const newServer = this.algod_path;
      const port = '';
      const token = { 'X-API-key': this.algod_token };
      var algodClient = new algosdk.Algodv2(token, newServer, port);
      console.log("algodClient",algodClient);
      return resolve(algodClient);
    })
  }


  //최소 거래 수수료 가져오기
  public getMinFee = async()=> {
    return new Promise(async(resolve)=>{
      var algodClient = await this.getConnection();
      var params = algosdk.ALGORAND_MIN_TX_FEE;
      return resolve(params);
    })
  }

  //거래정보를 byte로 변환. 거래 수수료 계산 목적
  //수수료는 [최소 수수료 1000 마이크로 알고] 와 [거래정보 byte*byte당 수수료] 중 더 큰것으로 계산
  txnToByte = async(from_address,mnemonic,to_address,token_id:number,sent_amount:number,isAssetTransfer:boolean) =>  {
    return new Promise(async(resolve)=>{
      type Account = {
        [key:string] : any
      }
      var account:Account = await this.getAccount(mnemonic);
      var sk = account.sk; 
      var sender = from_address;
      var revocationTarget = undefined; //undefinde로 되어 있어야 이 변수에 실주소가 있는지 없는지 검증하지 않는다.
      var closeRemainderTo = undefined; //undefinde로 되어 있어야 이 변수에 실주소가 있는지 없는지 검증하지 않는다.
      var algodClient:any = await this.getConnection();
      var params:any = await algodClient.getTransactionParams().do();
      params.fee = algosdk.ALGORAND_MIN_TX_FEE;
      params.flatFee =  true;
      var receiver = to_address;
      var enc = new TextEncoder();
      var note = enc.encode("Hello World");
      var amount = sent_amount;
      var txn;
      if(isAssetTransfer){
        var tokenID = token_id;
        txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
            sender, 
            receiver,
            closeRemainderTo, 
            revocationTarget,
            amount,  
            note, 
            tokenID, 
            params);
      }else{
        txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: sender, 
          to: receiver, 
          amount: amount, 
          note: note, 
          suggestedParams: params
        });
      }
      var rawSignedTxn = txn.signTxn(sk);
      var txId = txn.txID().toString();
      var pay_txn_bytes = algosdk.encodeObj(txn.get_obj_for_encoding());
      return resolve(pay_txn_bytes.length);
    });
  };

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

  //암호화폐 거래(송금)
  sendTxn = async (from_address,mnemonic,to_address,token_id,sent_amount,isAssetTransfer:boolean) => {
    return new Promise(async(resolve)=>{
      var algodClient:any = await this.getConnection();
      var params = await algodClient.getTransactionParams().do();
      console.log(params);
      var amount = Math.floor(Math.random() * 1000);
      var recoveredAccount = algosdk.mnemonicToSecretKey(mnemonic);
      var txn;
      if(isAssetTransfer){
        txn = {
          "from": from_address,
          "to": to_address,
          "fee": algosdk.ALGORAND_MIN_TX_FEE,
          "amount": amount,
          "firstRound": params.firstRound,
          "lastRound": params.lastRound,
          "genesisID": params.genesisID,
          "genesisHash": params.genesisHash,
          "note": new Uint8Array(0),
        };
      }else{
        txn = {
          "from": from_address,
          "to": to_address,
          "fee": algosdk.ALGORAND_MIN_TX_FEE,
          "amount": amount,
          "closeRemainderTo":undefined, 
          "revocationTarget":undefined,
          "tokenID":token_id, 
          "firstRound": params.firstRound,
          "lastRound": params.lastRound,
          "genesisID": params.genesisID,
          "genesisHash": params.genesisHash,
          "note": new Uint8Array(0),
        };
      }
      let signedTxn = algosdk.signTransaction(txn, recoveredAccount.sk);
      let sendTx = await algodClient.sendRawTransaction(signedTxn.blob).do();
      console.log("Transaction : " + sendTx.txId);
  })
}


//test 목적. 개발자 계정 정보 가져오기
getDevAccount = async () => {
  return new Promise(async(resolve)=>{
    var configJsonUnknown = await this.getConfigJson();
    var configJson:any = configJsonUnknown;
    //보내는 사람 개인키 가져와서 서명하기
    var devMnemonic = configJson.SmartContractParams.dev_mnemonic;
    var devAddress = configJson.SmartContractParams.dev_address;
    type Account = {
      [key:string] : any
    }
    var account:Account = await this.getAccount(devMnemonic);
    return resolve(devMnemonic);
  })
}

//계정정보 추가하기
//mnemonic 기반으로 계정정보 가져와서 반환
importAccount = async (mnemonic) => {
  console.log("import account",mnemonic);
  return new Promise(async(resolve,reject)=>{
    try{
      type Account = {
        [key:string] : any
      }
      var account:Account = await this.getAccount(mnemonic);
      var result:boolean;
      if(account!=null){
        result=true;
      }else{
        result=false;
      }
      resolve([result,account.addr]);
    }catch(err){
      reject(err);
    }
    })
  }

  //mnemonic 정보 가져오기
  //저장소에 저장된 계정 정보를 불러오고, 입력된 주소와 동일한 주소의 니모닉만 반환
  getMnemonic(address){
    this.storageService.getDecryption("accounts",null).then(async(response)=>{
      var responseToAny:any = response;
      var getAccount = responseToAny.find(account => account.addr === address);
      var mnemonic:string = getAccount.mnemonic;
      return mnemonic;
    });
  }

//입력된 니모닉에서 계정정보 가져오기(시크릿키 포함)
getAccount = async(mnemonic) => {
  return new Promise((resolve,reject)=>{
    try{
      let account = algosdk.mnemonicToSecretKey(mnemonic);
      resolve(account);
      console.log(account);
    }catch(e){
      reject(e);
    }
  })
}

//계정생성하기
//생경한 결과 생성된 퍼블릭 주소와 니모닉을 콜론으로 연결하여 하나의 string으로 반환
createAccount = () => {
  return new Promise((resolve)=>{
    try {  
      const myaccount = algosdk.generateAccount();
      let account_mnemonic = algosdk.secretKeyToMnemonic(myaccount.sk);
      let account_address = myaccount.addr;
      var result = account_address.concat(":",account_mnemonic);
      return resolve(result);
    }
  catch (err) {
      console.log("err", err);
    }
  })
}

//유효한 주소인지 확인하기 (transaction 요청시 send page)
 isValidAddress = async(address) => {
  return new Promise((resolve,reject)=>{
    try{
      var isValid = algosdk.isValidAddress(address); //boolean반환
      resolve(isValid);
    }catch(e){
      if(e==null||e==""){
        e = "It is invalid";
      }
      reject(e);
    }
  })
 }



//json으로 저장된 정보 가져오기
//capacitor런타임의 경우 파일로 저장된 정보를 가져와서 읽기
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
