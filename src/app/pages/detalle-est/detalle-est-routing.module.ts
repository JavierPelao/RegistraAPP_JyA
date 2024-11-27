import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleEstPage } from './detalle-est.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleEstPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleEstPageRoutingModule {}
