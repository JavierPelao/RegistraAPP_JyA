import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WelcomealumPage } from './welcomealum.page';

const routes: Routes = [
  {
    path: '',
    component: WelcomealumPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WelcomealumPageRoutingModule {}
