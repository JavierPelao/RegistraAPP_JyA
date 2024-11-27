import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  recuperarPassword() {
    console.log('Correo ingresado:', this.correo); // Verificar el correo ingresado

    if (this.correo) {
      this.authService.recuperarPassword(this.correo).subscribe(
        async (response) => {
          // Muestra un mensaje de éxito si se envió correctamente
          console.log('Respuesta del servidor:', response);
          const alert = await this.alertController.create({
            header: 'Éxito',
            message: 'Se ha enviado un correo con las instrucciones para recuperar la contraseña.',
            buttons: ['OK']
          });
          await alert.present();
          this.router.navigate(['/home']);
        },
        async (error) => {
          // Muestra un mensaje de error si ocurrió un problema
          console.error('Detalles del error:', error);
          const alert = await this.alertController.create({
            header: 'Error',
            message: error.error?.message || 'Hubo un problema al enviar la solicitud. Intenta nuevamente.',
            buttons: ['OK']
          });
          await alert.present();
        }
      );
    } else {
      this.mostrarAlerta('Por favor, ingresa un correo válido.');
    }
  }

  // Método para mostrar alertas
  async mostrarAlerta(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Atención',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
}
