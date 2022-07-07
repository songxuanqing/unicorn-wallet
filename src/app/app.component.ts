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
      url: '/folder/wallet', 
      icon: 'wallet' 
    }, 
    { 
      title: 'Outbox', 
      url: '/folder/Outbox', 
      icon: 'paper-plane' 
    }, 
    { 
      title: 'Favorites', 
      url: '/folder/Favorites', 
      icon: 'heart' 
    }, 
    { 
      title: 'Sign Up', 
      url: '/folder/SignUp', 
      icon: 'person-add' 
    }, 
    { 
      title: 'Log In', 
      url: '/folder/LogIn', 
      icon: 'log-in' 
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
