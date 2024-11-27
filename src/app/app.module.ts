import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicStorageModule } from '@ionic/storage-angular';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { QRCodeModule } from 'angularx-qrcode';
import { HttpClientModule } from '@angular/common/http'; // Para las solicitudes HTTP

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    QRCodeModule, // Módulo para la generación de códigos QR
    IonicStorageModule.forRoot(), // Configuración de almacenamiento local
    HttpClientModule // Módulo para manejar solicitudes HTTP
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
