import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [ 
    { 
      title: 'Wallet', 
      url: '/wallet', 
      icon: 'wallet' 
    }, 
    { 
      title: 'Account', 
      url: '/account', 
      icon: 'person-circle' 
    },
    { 
      title: 'Setting', 
      url: '/setting', 
      icon: 'settings' 
    }, 
    { 
      title: 'Lock', 
      url: '/folder/LogOut', 
      icon: 'lock-closed' 
    } 
  ];
  constructor() {}

}
