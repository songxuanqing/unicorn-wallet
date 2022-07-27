import { Injectable } from '@angular/core';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {
 
  constructor(private clipboard: Clipboard,
    public platform: Platform,) { }
  // Copy
  copyString(copyInputText){
    return new Promise(async (resolve)=>{
      if(this.platform.is('capacitor')){
        this.clipboard.copy(copyInputText);
        return resolve(true);
      }else{
        await navigator.clipboard.writeText(copyInputText);
        return resolve(true);
      }

    })
  }

  // Paste
  pasteText(){
    this.clipboard.paste().then(
      (resolve: string) => {
         console.log(resolve);
       },
       (reject: string) => {
         console.error('Error: ' + reject);
       }
     );
  }
  // Clear
  clearText(){
    this.clipboard.clear();
  }
}
