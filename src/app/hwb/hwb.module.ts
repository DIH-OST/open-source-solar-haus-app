import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HwbPageRoutingModule } from './hwb-routing.module';

import { HwbPage } from './hwb.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HwbPageRoutingModule
  ],
  declarations: [HwbPage]
})
export class HwbPageModule {}
