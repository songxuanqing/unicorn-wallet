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
          chrome.storage.local.set({[key]: value}, function() {
            //key변수를 key 요소에 할당
            //value변수를 value요소에 할당
            console.log('Key is set to ' + key);
            console.log('Value is set to ' + value);
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
        console.log(`check name ${value}!`);
        return resolve(value);
      })
    }else{
      let callbackPromise = new Promise((resolve, reject) => {
        if(key=="accounts"){
          chrome.storage.local.get([key], function(result) {
            //key요소 종 요소 값이 key변수값인것 가져오기
            console.log("result.accounts",result)
            //결과값이 object로 반환되는데, 이때 요소 값은 각각 key명으로 할당되어 있다.
            //따라서 result.key변수명String같이 사용한다.
            return resolve(result.accounts);
        });  
        }
        else if(key=="keyForUser"){
          chrome.storage.local.get([key], function(result) {
            console.log("result.keyForUser",result)
            return resolve(result.keyForUser);
        });  
        }
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
    console.log("key",key);
    return new Promise((response)=>{
      //encryptionKey = pw를 입력해서 keyForUser의 암호화된 hashedpw를 가져온다.
      this.getDecryption(key,encryptionKey).then(async(resolve)=>{//keyForUser -> hash
        var responseToAny:any = resolve; //JSON 객체로 반환된 원래값. undefined를 any로 할당해서 String변환
        var encryptedValue = responseToAny;
        console.log('getHashedDecryption',encryptedValue);
        //가져온 hash pw와 입력된 pw 비교
        //동일할 경우 validPassword는 true이다.
        var validPassword = await bcrypt.compare(encryptionKey,encryptedValue);
        if(validPassword){ //hash String과 입력한 값이 일치하는지 확인
          console.log("true?");
          this.hashedKey = encryptedValue; //전역변수로 선언된 hashedKey에 값 할당.
          return response(true); //로그인 통과용 response, true면 로그인 통과
        }else{
          console.log("false?");
          return response(false);
        }
      }) 
    })
  }

  //저장소에 key:value로 저장한다. 이때 value는 encryptionKey로 암호화해서 암호화된 값으로 저장한다.
  public setEncryption(key: string, value: any, encryptionKey:string|null){
    return new Promise (resolve=>{
      console.log("hashedpw",value);
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
      console.log("key",rk,"value",b);
      var eb = this.encodeByAES256(rk, b); //32자 키로, string value를 암호화
      console.log(eb); //암호화된 해시
      this.set(key, eb).then(()=>{ //key:keyForUser 와 암호호된 hash저장
        console.log("set to the db");
        return resolve("done");
      });
    })
    
  }

  //암호화된 값을 복호화해서 가져온다.
  public getDecryption = (key:string, encryptionKey:string|null) => {
    console.log("key",key);
    return new Promise(async(resolve)=>{
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
      console.log(this.hashedKey);
      var rk = String(k).padEnd(32, padding); // AES256은 key 길이가 32자여야 함
      var eb = encryptedValue;
      console.log("key",rk,"value",eb);
      var b = this.decodeByAES256(rk, eb);
      console.log('Item:',JSON.parse(b));
      return resolve(JSON.parse(b)); //원래값 반환. JSON객체 형태로 변경하여 반환
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

  // public setEncryption(key: string, value: any){
  //   // 암호화 키
  //   var encryptionKey = 'we love novarand'.repeat(2);
  //   // number used once 매번 바꿔 사용하는 번호 
  //   var nonce = nanoid(12);
  //   // var nonce = crypto.randomBytes(12);
  //   // Addtional Associated Data : https://cloud.google.com/kms/docs/additional-authenticated-data
  //   var aad = Buffer.from('0123456789', 'hex');
  //   // aes 256 ccm 암호화 객체 생성 TAG는 16바이트
  //   var cipher = aes.createCipheriv('aes-256-gcm', encryptionKey, nonce,  {
  //     authTagLength: 16
  //   });
  //   // 평문 데이터
  //   var encryptionValue = value;
  //   // aad 추가
  //   cipher.setAAD(aad, {
  //     plaintextLength: Buffer.byteLength(encryptionValue)
  //   });
  //   // 평문 암호화
  //   var ciphertext = cipher.update(encryptionValue, 'utf8');
  //   // 암호화 완료 - 이 이후로는 더이상 이 암호화 객체를 사용할 수 없음
  //   cipher.final();
  //   // 최종 암호화 TAG(MAC) 값 얻기
  //   var tag = cipher.getAuthTag();
  //   // 암호화
  //   console.log(ciphertext.toString("hex"));
  //   // console.log(`암호화: ${ciphertext.toString("hex")}, 태그: ${tag.toString("hex")}, nonce: ${nonce.toString('hex')}, aad: ${aad.toString('hex')}`);
  //   // var result =  ciphertext.toString("hex") +':'+tag.toString("hex")+':'+nonce.toString('hex')+':'+aad.toString('hex');
  //   // this._storage?.set(key, result);
  // }

  // public getDecryption = async(key: string) => {
  //   return new Promise(async(resolve)=>{
  //     var encryptedValue:string = await this._storage?.get(key);
  //     var splitArrayEncryptedValue = encryptedValue.split('');
  //     //0: 암호화된 평문, 1: 태그, 2: nonce, 3:add
  //     // 암호화 키
  //     var decryptionKey = 'we love novarand'.repeat(2);
  //     // Addtional Associated Data : https://cloud.google.com/kms/docs/additional-authenticated-data
  //     var aad = Buffer.from(splitArrayEncryptedValue[3], 'hex');
  //     // 암호화시 사용한 nonce 암호화시 전달 받거나 서로간의 규약이 필요( 일부만 받아 조합해서 사용 등)
  //     var nonce = Buffer.from(splitArrayEncryptedValue[2], 'hex')
  //     // 암호화시 TAG
  //     var tag = Buffer.from(splitArrayEncryptedValue[1], 'hex')
  //     // 암호화 데이터
  //     var ciphertext = Buffer.from(splitArrayEncryptedValue[0], 'hex')
  //     // 암호화 객체 생성 (key와 nonce 추가)
  //     var decipher = aes.createDecipheriv('aes-128-ccm', decryptionKey, nonce,  {
  //       authTagLength: 16
  //     });
  //     // 태그 추가
  //     decipher.setAuthTag(tag);
  //     // aad 추가
  //     decipher.setAAD(aad, {
  //       plaintextLength: ciphertext.length
  //     });
  //     // 복호화 시작!
  //     var receivedPlaintext = decipher.update(ciphertext, null, 'utf8');
      
  //     try {
  //       // 복호화 완료 - 더 이상 복호화 할 수 없음.
  //       decipher.final();
  //     } catch (err) {
  //       console.error('Authentication failed!');
  //       return;
  //     }
  //     // 복화화 결과 출력!
  //     console.log(receivedPlaintext);
  //     return resolve(receivedPlaintext);
  //   })
  // }
  // public remove(key: string) {
  //   this._storage?.remove(key);
  // }
  // public clear() {
  //   this._storage?.clear();
  // }
  // public length(){
  //   this._storage?.length();
  // }
  
  // public forEach(key:string, value:string, index:number){
  //   this._storage?.forEach((key, value, index) => {

  //   });
  // }
}