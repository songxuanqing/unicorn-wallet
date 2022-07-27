import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'loader',
    loadChildren: () => import('./pages/loader/loader.module').then( m => m.LoaderPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'wallet',
    loadChildren: () => import('./pages/wallet/wallet.module').then( m => m.WalletPageModule)
  },
  {
    path: 'send',
    loadChildren: () => import('./pages/send/send.module').then( m => m.SendPageModule)
  },
  {
    path: 'confirm',
    loadChildren: () => import('./pages/confirm/confirm.module').then( m => m.ConfirmPageModule)
  },
  {
    path: 'token',
    loadChildren: () => import('./pages/token/token.module').then( m => m.TokenPageModule)
  },
  {
    path: 'account',
    loadChildren: () => import('./pages/account/account.module').then( m => m.AccountPageModule)
  },
  {
    path: 'security',
    loadChildren: () => import('./pages/security/security.module').then( m => m.SecurityPageModule)
  },
  {
    path: 'history',
    loadChildren: () => import('./pages/history/history.module').then( m => m.HistoryPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./pages/signup/signup.module').then( m => m.SignupPageModule)
  },
  {
    path: 'export-security',
    loadChildren: () => import('./pages/export-security/export-security.module').then( m => m.ExportSecurityPageModule)
  },
  {
    path: 'export-list',
    loadChildren: () => import('./pages/export-list/export-list.module').then( m => m.ExportListPageModule)
  },
  {
    path: 'import-or-create',
    loadChildren: () => import('./pages/import-or-create/import-or-create.module').then( m => m.ImportOrCreatePageModule)
  },
  {
    path: 'setting',
    loadChildren: () => import('./pages/setting/setting.module').then( m => m.SettingPageModule)
  },
  {
    path: 'change-pw',
    loadChildren: () => import('./pages/change-pw/change-pw.module').then( m => m.ChangePWPageModule)
  },
  {
    path: 'image-full-screen',
    loadChildren: () => import('./pages/image-full-screen/image-full-screen.module').then( m => m.ImageFullScreenPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
