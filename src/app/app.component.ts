import { Component } from '@angular/core';
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
      title: 'Security', 
      url: '/security', 
      icon: 'shield-checkmark' 
    }, 
    { 
      title: 'Log Out', 
      url: '/folder/LogOut', 
      icon: 'log-out' 
    } 
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor() {}
}
