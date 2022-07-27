import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImageFullScreenPageRoutingModule } from './image-full-screen-routing.module';

import { ImageFullScreenPage } from './image-full-screen.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImageFullScreenPageRoutingModule
  ],
  declarations: [ImageFullScreenPage]
})
export class ImageFullScreenPageModule {}
