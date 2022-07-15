import { Component, OnInit } from '@angular/core';
import { Blockchain2Service } from '../../services/blockchain2.service';
import { Blockchain3Service } from '../../services/blockchain3.service';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { AccountStored } from '../../models/account-stored';
import { AccountWithAmount } from '../../models/account-with-amount';

@Component({
  selector: 'app-export-list',
  templateUrl: './export-list.page.html',
  styleUrls: ['./export-list.page.scss'],
})
export class ExportListPage implements OnInit {
  public accountList:Array<AccountStored> = [];
  public accountListWithAmount:Array<AccountWithAmount> = [];
  
  constructor(private router:Router,
    private route:ActivatedRoute,
    private apiService: Blockchain2Service,
    private blockchainSDKService: Blockchain3Service,
    private storageService: StorageService,) { }

  ngOnInit() {
  }
  ionViewWillEnter(){
    this.getAccountList();
    //this.getDevAccount();
  }
  getAccountList(){
    this.storageService.getDecryption("accounts",null).then(async(response)=>{
      var responseToAny:any = response;
      this.getAccountListFromStorage(responseToAny).then(async(response)=>{
        this.getAmountByAccount();
      })
    });
  }
  getAccountListFromStorage(responseToAny){
    return new Promise((resolve)=>{
      for(var i = 0; i<responseToAny.length; i++){
        var accountStored:AccountStored = {
         name:"",
         addr:"",
         mnemonic:"",
        };
       type Temp = {
         [key:string]: any
       }
       var temp:Temp = responseToAny[i];
       accountStored.name = temp.name;
       accountStored.addr = temp.addr;
       accountStored.mnemonic = temp.mnemonic;
       this.accountList.push(accountStored);
       var account_with_amount:AccountWithAmount = {
         amount:0,
         account:accountStored,
        };
       this.accountListWithAmount.push(account_with_amount);
     }
     return resolve("done");
    })
  }
  async getAmountByAccount(){
    for (var item of this.accountListWithAmount){
      var response = await this.apiService.getAccountInfo(item.account.addr)
      var accountData:any = response;
      var accountAmount:number = accountData.amount;
      item.amount = accountAmount;
    }
  }


  goToExportSecurity(account){
    const navigationExtras: NavigationExtras = {
      state: {
        account:account,
      },
    };
    this.router.navigateByUrl('/export-security',navigationExtras);
  }

}
