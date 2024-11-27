import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';  // Correct import for QR Code generation
import { IonicModule } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';  // Correct BarcodeScanner import
import { WelcomealumPageRoutingModule } from './welcomealum-routing.module';
import { WelcomealumPage } from './welcomealum.page';  // Correct import
import { NgxScannerQrcodeModule } from 'ngx-scanner-qrcode';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QRCodeModule,  // Import the QR Code module
    WelcomealumPageRoutingModule,
    NgxScannerQrcodeModule  // Import this module
  ],
  providers: [BarcodeScanner],  // Add BarcodeScanner to providers
  declarations: [WelcomealumPage],  // Declare the WelcomealumPage
  schemas: [CUSTOM_ELEMENTS_SCHEMA]  // Add schemas if necessary
})
export class WelcomealumPageModule {}
