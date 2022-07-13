import { Injectable } from '@angular/core';
// import { Storage } from '@ionic/storage-angular';
import * as CryptoJS from 'crypto-js';
import { Platform } from '@ionic/angular';
import { Storage } from '@capacitor/storage';
// <reference types="@types/chrome"/>
//  import {chrome} from '@types/chrome';
//< reference path= '' pathTo/chrome.d.ts '' / > 
declare var chrome;

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: Storage;
  private crypto: CryptoJS;
 
  constructor(
    // private storage: Storage, 
    public platform: Platform,) {
    this.init();
  }

  async init() {
    // const storage = await this.storage.create();
    // this._storage = storage;
  }

  setName = async (key,value) => {
    await Storage.set({
      key: 'accounts',
      value: value,
    });
  };

  public set(key, value) {
    if(this.platform.is('capacitor')){
      return new Promise((resolve)=>{
        this.setName(key,value);
        return resolve("completed");
      })    
    }else{
      return new Promise(async(resolve)=>{
        chrome.storage.local.set({"accounts": value}, function() {
          console.log('Key is set to ' + key);
          console.log('Value is set to ' + value);
        });
        // this._storage?.set(key, value);
        return resolve("completed");
      })
    }
  }
  
  checkName = async (key) => {
    return new Promise(async(resolve)=>{
      const { value } = await Storage.get({ key: 'accounts' });
      console.log(`check name ${value}!`);
      return resolve(value);
    })
  };

  public get(key) : Promise<any>{
    if(this.platform.is('capacitor')){
      return new Promise(async(resolve)=>{
        var value = await this.checkName(key);
        return resolve(value);
      })
    }else{
      let callbackPromise = new Promise((resolve, reject) => {
        chrome.storage.local.get("accounts", function(result) {
          console.log("result.accounts",result)
          return resolve(result.accounts);
      });     
    })
    return callbackPromise;
    // return this._storage?.get(key);
    }
  }

  public setEncryption(key: string, value: any){
    var valueToString = JSON.stringify(value);
    var k = 'we love novarand'.repeat(2);
    var rk = k.padEnd(32, " "); // AES256은 key 길이가 32자여야 함
    var b = valueToString;
    var eb = this.encodeByAES56(rk, b);
    console.log(eb);
    this.set(key, eb).then(()=>{
    });
  }

  encodeByAES56(key, data){
    const cipher = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(""),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });
    return cipher.toString();
}

  public getDecryption = (key) => {
    return new Promise(async(resolve)=>{
      var encryptedValue = await this.get(key);
      var k = 'we love novarand'.repeat(2); // 암호화에서 사용한 값과 동일하게 해야함
      var rk = k.padEnd(32, " "); // AES256은 key 길이가 32자여야 함
      var eb = encryptedValue;
      var b = this.decodeByAES256(rk, eb);
      console.log('Item: %o',b);
      return resolve(JSON.parse(b));
    })
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