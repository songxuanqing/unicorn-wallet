import { Injectable } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  constructor(private menu: MenuController) { }
  openMenu(){
    this.menu.open();
  }
  
}
