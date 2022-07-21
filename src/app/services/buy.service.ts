import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class BuyService {
  public imgUrls:Array<any> = [];

  constructor( ) { 
      var imgUrl = {
        marketName:"wyre",
        imgUrl:"https://files.readme.io/179c9f9-Wyre-Logo-Lockup-Black_2.png", // wyre 로고 이미지
      }
      this.imgUrls.push(imgUrl);
  }

  createWyreUrl = (walletAddress) => {
    return new Promise(resolve=>{
      const wyreCurrencies = ['ALGO', 'USDT', 'USDC', 'DAI'];
      var queryParams = new URLSearchParams({
        destCurrency: wyreCurrencies[0],
        dest: wyreCurrencies[0]+':'+walletAddress,
      });
      return resolve(`https://pay.sendwyre.com/purchase?${queryParams}`);
    })
  };
}
