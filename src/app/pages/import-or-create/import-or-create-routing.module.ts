import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImportOrCreatePage } from './import-or-create.page';

const routes: Routes = [
  {
    path: '',
    component: ImportOrCreatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImportOrCreatePageRoutingModule {}
