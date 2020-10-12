import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HwbPage } from './hwb.page';

const routes: Routes = [
  {
    path: '',
    component: HwbPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HwbPageRoutingModule {}
