import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DetallePageRoutingModule } from './detalle-routing.module';
import { DetallePage } from './detalle.page';
import { QRCodeModule } from 'angularx-qrcode'; // Importación del módulo QRCode

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallePageRoutingModule,
    QRCodeModule // Agrega el módulo QRCode aquí
  ],
  declarations: [DetallePage]
})
export class DetallePageModule {}
