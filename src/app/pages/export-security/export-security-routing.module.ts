import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExportSecurityPage } from './export-security.page';

const routes: Routes = [
  {
    path: '',
    component: ExportSecurityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExportSecurityPageRoutingModule {}
