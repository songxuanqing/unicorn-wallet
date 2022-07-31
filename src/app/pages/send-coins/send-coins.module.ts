import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SendCoinsPageRoutingModule } from './send-coins-routing.module';

import { SendCoinsPage } from './send-coins.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SendCoinsPageRoutingModule
  ],
  declarations: [SendCoinsPage]
})
export class SendCoinsPageModule {}
