import { Injectable } from '@angular/core';
import { Clipboard } from '@ionic-native/clipboard/ngx';

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {
 
  constructor(private clipboard: Clipboard) { }
  // Copy
  copyString(copyInputText){
    return new Promise((resolve)=>{
      this.clipboard.copy(copyInputText);
      return resolve(true);
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
