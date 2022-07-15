import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExportListPage } from './export-list.page';

const routes: Routes = [
  {
    path: '',
    component: ExportListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExportListPageRoutingModule {}
