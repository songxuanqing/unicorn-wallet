import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExportSecurityPageRoutingModule } from './export-security-routing.module';

import { ExportSecurityPage } from './export-security.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExportSecurityPageRoutingModule
  ],
  declarations: [ExportSecurityPage]
})
export class ExportSecurityPageModule {}
