import { Injectable } from '@angular/core';
import { AccountStored } from '../models/account-stored';

@Injectable({
  providedIn: 'root'
})
export class GetAccountService {
  account: AccountStored;
  accountList: Array<AccountStored>
  constructor() { }
  setAccount(account){
    this.account = account;
  }
  getAccount(){
    this.accountList.forEach(item=>{
      if(item.isMain){
        this.account = item;
      }
    })
    return this.account;
  }
  setAccountList(list){
    this.accountList = list;
  }
  getAccountList(){
    return this.accountList;
  }
  

}
