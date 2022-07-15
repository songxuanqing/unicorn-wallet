import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImportOrCreatePageRoutingModule } from './import-or-create-routing.module';

import { ImportOrCreatePage } from './import-or-create.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImportOrCreatePageRoutingModule
  ],
  declarations: [ImportOrCreatePage]
})
export class ImportOrCreatePageModule {}
