import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicStorageModule } from '@ionic/storage-angular';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { QRCodeModule } from 'angularx-qrcode';
import { HttpClientModule } from '@angular/common/http'; // Para las solicitudes HTTP
import { QrScannerService } from './services/qr-scanner-service.service';


export function initQrScannerService(qrScannerService: QrScannerService) {
  return () => qrScannerService.init();
}

export function qrScannerService() {
  return {
    provide: APP_INITIALIZER,
    useFactory: initQrScannerService,
    deps: [QrScannerService],
    multi: true,
  };
}

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
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, qrScannerService()],
  bootstrap: [AppComponent],
})
export class AppModule {}
