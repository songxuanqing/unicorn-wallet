import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChangePWPage } from './change-pw.page';

const routes: Routes = [
  {
    path: '',
    component: ChangePWPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChangePWPageRoutingModule {}
