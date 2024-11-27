import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  perfilData: any = {}; // Datos del perfil del usuario
  nuevaContrasena: string = ''; // Nueva contraseña ingresada

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      const userInfoObservable = await this.authService.getUserInfo();
      userInfoObservable.subscribe(
        (response: any) => {
          console.log('Datos del perfil:', response);
          this.perfilData = response; // Asegúrate de que esta línea esté asignando correctamente la respuesta
        },
        (error) => {
          console.error('Error obteniendo el perfil:', error);
        }
      );
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
    }
  }
  

  async cambiarContrasena() {
    if (!this.nuevaContrasena) {
      this.mostrarAlerta('Error', 'Por favor, ingrese una nueva contraseña.');
      return;
    }

    try {
      (await this.authService.cambiarContrasena({ password: this.nuevaContrasena })).subscribe(
        async (response) => {
          console.log('Contraseña cambiada exitosamente:', response);
          this.mostrarAlerta('Éxito', 'Contraseña cambiada exitosamente.');
        },
        async (error) => {
          console.error('Error al cambiar la contraseña:', error);
          this.mostrarAlerta('Error', 'Hubo un problema al cambiar la contraseña.');
        }
      );
    } catch (error) {
      console.error('Error en el proceso de cambio de contraseña:', error);
      this.mostrarAlerta('Error', 'Hubo un problema en la solicitud de cambio de contraseña.');
    }
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

  cerrarSesion() {
    if (confirm('¿Desea cerrar sesión?')) {
      this.router.navigate(['/login']);
    }
  }
  
}
