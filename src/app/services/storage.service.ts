import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { Platform } from '@ionic/angular';
import { Storage } from '@capacitor/storage'; //capacitor runtime 저장소(플랫폼 스토리지 사용하게 한다)
import * as bcrypt from 'bcryptjs';
declare var chrome; //변수가 다른 곳에 생성되었음을 TypeScript에 알린다.
//다른 파일에서 글로벌 변수로 d.ts 파일에 선언하면 declare var을 통해 참조할 수 있다.

@Injectable({
  providedIn: 'root'
})

export class StorageService {
  private storage: Storage; //capacitor runtime에서 플랫폼 스토리지
  private crypto: CryptoJS; //암호화용 객체
  private hashedKey: string; //해쉬된 비밀번호
 
  constructor( //플랫폼 구분을 위한 플랫폼 인식 객체
    public platform: Platform,) {
    this.init();
  } //초기화

  async init() {
  }


  //데이터 저장 함수. 
  //플랫폼에 따라 storage(플랫폼 저장소) or chrome.storage(크롬 C드라이브 저장소) 사용
  public set(key, value) {
    if(this.platform.is('capacitor')){
      return new Promise(async(resolve)=>{
        await Storage.set({
          key: key,
          value: value,
        });
        //key요소에 key변수 할당
        //value요소에 value 변수 할당
        return resolve("completed");
      })    
    }else{
      return new Promise(async(resolve)=>{
        try{
          console.log(key,"value",value);
          chrome.storage.local.set({[key]: value}, function() {
            //key변수를 key 요소에 할당
            //value변수를 value요소에 할당
            return resolve("done");
          });
        }catch(e){
          console.log(e);
        }
      })
    }
  }

  //저장소에서 데이터 가져오기
  //runtime에 따라 플랫폼 저장소 또는 크롬 저장소에서 가져온다.
  public get(key) : Promise<any>{
    if(this.platform.is('capacitor')){
      return new Promise(async(resolve)=>{
        var { value } = await Storage.get({ key: key });
        //key요소 종 요소 값이 key변수값인것 가져오기
        return resolve(value);
      })
    }else{
      let callbackPromise = new Promise((resolve, reject) => {
        try{
          chrome.storage.local.get([key], function(result) {
            return resolve(result[key]);
        });
        }catch{
          return reject(new Error("Error!"));
        }

        // if(key=="accounts"){
        //   chrome.storage.local.get([key], function(result) {
        //     return resolve(result.accounts);
        // });  
        // }
        // else if(key=="keyForUser"){
        //   chrome.storage.local.get([key], function(result) {
        //     return resolve(result.keyForUser);
        // });  
        // }
        // else if(key=="sendTxn"){
        //   chrome.storage.local.get([key], function(result) {
        //     return resolve(result.sendTxn);
        // });
        // }
        // else if(key=="recentlySent"){
        //   chrome.storage.local.get([key], function(result) {
        //     return resolve(result.recentlySent);
        // });
        // }
        // else if(key=="currency"){
        //   chrome.storage.local.get([key], function(result) {
        //     return resolve(result.currency);
        // });
        // }
        // else if(key=="network"){
        //   chrome.storage.local.get([key], function(result) {
        //     return resolve(result.network);
        // });
        // }
        // else if(key=="portfolioNetwork"){
        //   chrome.storage.local.get([key], function(result) {
        //     return resolve(result[key]);
        // });
        // }
        // else if(key=="portfolioAccounts"){
        //   chrome.storage.local.get([key], function(result) {
        //     return resolve(result[key]);
        // });
        // }

    })
    return callbackPromise;
    }
  }

  //회원가입 시 한번 사용
  //keyForUser를 key로 hash된 pw를 value로 저장한다.
  //해당 hash된 pw를 또한 pw로 암호화해서 저장한다.
  public setHashedEncryption(key:string, value:any, encryptionKey:string){
    return new Promise(async(resolve)=>{
      // 해시 생성을 위해한 솔트 생성
      var salt = await bcrypt.genSalt(10);
      // pw를 해시화한다.
      var hashedPw = await bcrypt.hash(value, salt);
      //keyForUser를 key로 hash된 pw를 value로 저장한다.
      //또한 암호화해서 저장하므로, 암호화용 key(encryptionKey)를 같이 보낸다.
      //이때 암호화용 key는 pw이다.
      await this.setEncryption(key,hashedPw,encryptionKey); //keyForUser and hash and pw 
      //전역변수 해시키를 저장한다.
      //로그인 이후에 서명 시 비밀번호 입력 없이 트랜잭션 전송하기 위함이다.
      this.hashedKey = hashedPw;
      return resolve("done");
    })
  }

 //로그인 시 사용
 //pw를 입력해 hash된 pw를 가져와 입력된 pw와 비교한다.
  public getHashedDecryption(key:string, encryptionKey:string){
    //encryptionKey = pw
    return new Promise((resolve,reject)=>{
      //encryptionKey = pw를 입력해서 keyForUser의 암호화된 hashedpw를 가져온다.
      this.getDecryption(key,encryptionKey).then(async(response)=>{//keyForUser -> hash
        var responseToAny:any = response; //JSON 객체로 반환된 원래값. undefined를 any로 할당해서 String변환
        var encryptedValue = responseToAny;
        //가져온 hash pw와 입력된 pw 비교
        //동일할 경우 validPassword는 true이다.
        var validPassword = await bcrypt.compare(encryptionKey,encryptedValue);
        if(validPassword){ //hash String과 입력한 값이 일치하는지 확인
          this.hashedKey = encryptedValue; //전역변수로 선언된 hashedKey에 값 할당.
          return resolve(true); //로그인 통과용 response, true면 로그인 통과
        }else{
          return resolve(false);
        };
      }).catch(err=>{
        return reject(err);
      });
    })
  }

  //저장소에 key:value로 저장한다. 이때 value는 encryptionKey로 암호화해서 암호화된 값으로 저장한다.
  public setEncryption(key: string, value: any, encryptionKey:string|null){
    return new Promise (resolve=>{
      console.log("seten",key,value);
      //암호화대상은 string 이여야 하므로 string으로 변환한다.
      var valueToString = JSON.stringify(value); 
      var k:string = "";
      var padding:string ="";
      if(encryptionKey!=null){//회원가입과 같이 pw를 입력하는 경우는 해당 값이 null이 아니다.
        //암호화하는 키로서 입력받은 pw를 사용한다.
        k = encryptionKey;
        padding = encryptionKey.repeat(2); //AES256은 key길이가 32자여야 하므로 32를 맞추기 위한 패딩 필요한데,
        //패딩값으로 입력된 비밀번호를 2번 반복해서 준비한다.
      }else{
        k = this.hashedKey; //account정보 반환시
      }
      var rk = String(k).padEnd(32, padding); // AES256은 key 길이가 32자여야 함. hash256는 이미 32byte이므로 불필요
      var b = valueToString;
      var eb = this.encodeByAES256(rk, b); //32자 키로, string value를 암호화
       //암호화된 해시
      this.set(key, eb).then(()=>{ //key:keyForUser 와 암호호된 hash저장
        return resolve("done");
      });
    })
    
  }

  //암호화된 값을 복호화해서 가져온다.
  public getDecryption = (key:string, encryptionKey:string|null) => {
    return new Promise(async(resolve,reject)=>{
      console.log("getDes",this.hashedKey);
      try{
        var encryptedValue = await this.get(key); //암호화된 정보:hash,account
        var k:string="";
        var padding:string ="";
        if(encryptionKey!=null){
          //회원가입과 같이 pw를 입력하는 경우는 해당 값이 null이 아니다.
          //암호화하는 키로서 입력받은 pw를 사용한다.
          k = encryptionKey;
          padding = encryptionKey.repeat(2);
          //AES256은 key길이가 32자여야 하므로 32를 맞추기 위한 패딩 필요한데,
          //패딩값으로 입력된 비밀번호/hashedPW를 2번 반복해서 준비한다.
        }else{
          //이미 로그인한 상태에서 니모닉을 통한 서명을 가져올 때, 니모닉 정보를 가져와야 하므로,
          //기존에 존재하는 해시화된 pw를 반환한다. 이 값이 account를 복호화하는 key이다.
          k = this.hashedKey;
        }
        var rk = String(k).padEnd(32, padding); // AES256은 key 길이가 32자여야 함
        var eb = encryptedValue;
        var b = this.decodeByAES256(rk, eb);
        return resolve(JSON.parse(b)); //원래값 반환. JSON객체 형태로 변경하여 반환
      }catch(e){
        return reject(new Error("Error!"));
      }
    })
  }


  encodeByAES256(key, data){
    const cipher = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(""),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });
    return cipher.toString();
}

  decodeByAES256(key, data){
    const cipher = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(""),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });
    return cipher.toString(CryptoJS.enc.Utf8);
};

 remove(key){
  chrome.storage.local.remove([key]);
 }
}