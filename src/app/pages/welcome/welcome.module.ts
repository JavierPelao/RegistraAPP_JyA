import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { IonicModule } from '@ionic/angular';

import { WelcomePageRoutingModule } from './welcome-routing.module';

import { WelcomePage } from './welcome.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QRCodeModule, // Añadir el QRCodeModule aquí
    WelcomePageRoutingModule
  ],
  declarations: [WelcomePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]  // Agrega esto para evitar el error
})
export class WelcomePageModule {}
