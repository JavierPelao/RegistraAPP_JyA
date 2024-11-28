import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.page.html',
  styleUrls: ['./recuperar.page.scss'],
})
export class RecuperarPage {

  correo: string = ''; // Inicializar con una cadena vacía

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  async recuperarPassword() {
    console.log('Correo ingresado:', this.correo);

    if (this.correo) {
      this.authService.recuperarPassword(this.correo).subscribe(
        async (response: any) => { // Asegurar el tipo de la respuesta
          console.log('Respuesta del servidor:', response);
          const alert = await this.alertController.create({
            header: 'Éxito',
            message: 'Se ha enviado un correo con las instrucciones para recuperar la contraseña.',
            buttons: ['OK'],
          });
          await alert.present();
          this.router.navigate(['/home']);
        },
        async (error: any) => { // Manejo explícito del error
          console.error('Detalles del error:', error);
          const alert = await this.alertController.create({
            header: 'Error',
            message: error.error?.message || 'Hubo un problema al enviar la solicitud. Intenta nuevamente.',
            buttons: ['OK'],
          });
          await alert.present();
        }
      );
    } else {
      this.mostrarAlerta('Por favor, ingresa un correo válido.');
    }
  }

  async mostrarAlerta(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Atención',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
