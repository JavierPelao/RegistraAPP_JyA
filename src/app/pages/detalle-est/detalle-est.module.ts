import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleEstPageRoutingModule } from './detalle-est-routing.module';

import { DetalleEstPage } from './detalle-est.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleEstPageRoutingModule
  ],
  declarations: [DetalleEstPage]
})
export class DetalleEstPageModule {}
