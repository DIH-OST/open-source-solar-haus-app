import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'status',
        loadChildren: () => import('../status/status.module').then(m => m.StatusPageModule)
      },
      {
        path: 'statistics',
        loadChildren: () => import('../statistics/statistics.module').then(m => m.StatisticsPageModule)
      },
      {
        path: 'hwb',
        loadChildren: () => import('../hwb/hwb.module').then(m => m.HwbPageModule)
      },
      {
        path: 'more',
        loadChildren: () => import('../more/more.module').then(m => m.MorePageModule)
      }
    ]
  },
  {
    path: 'tabs',
    redirectTo: '/tabs/status',
    pathMatch: 'full'
  },
  {
    path: '',
    redirectTo: '/tabs/status',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
