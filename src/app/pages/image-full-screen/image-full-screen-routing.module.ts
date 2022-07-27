import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImageFullScreenPage } from './image-full-screen.page';

const routes: Routes = [
  {
    path: '',
    component: ImageFullScreenPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImageFullScreenPageRoutingModule {}
