import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  correo: string = '';
  password: string = '';
  perfil: string = '';  


  constructor(
    private alertController: AlertController,
    private router: Router,
    private authService: AuthService
  ) {}

  
  login() {
    this.authService.login(this.correo, this.password).subscribe(
      async (response) => {
        // Si el token y la autenticación son correctos
        if (response.auth && response.auth.token) {
          // Guardar el token de autenticación
          await this.authService.saveToken(response.auth.token);
  
          // Obtener el perfil directamente desde la respuesta del login
          const perfil = response.data.perfil;
  
          // Redirigir según el perfil del usuario
          if (perfil === 'estudiante') {
            this.router.navigate(['/welcomealum']);  // Página para estudiantes
          } else if (perfil === 'docente') {
            this.router.navigate(['/welcome']);  // Página para docentes
          } else {
            console.error('Perfil desconocido o faltante:', perfil);
            const alert = await this.alertController.create({
              header: 'Error',
              message: 'Perfil desconocido. No se puede redirigir.',
              buttons: ['OK'],
            });
            await alert.present();
          }
  
          // Guardar también el perfil en el almacenamiento local por si lo necesitas más tarde
          await this.authService.saveUserProfile(perfil, response.data.nombre_completo);
          
        } else {
          // Mostrar alerta si no se proporcionó el token o hubo un problema
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'Correo o contraseña incorrectos',
            buttons: ['OK'],
          });
          await alert.present();
        }
      },
      async (error) => {
        // Manejo de errores en caso de que la solicitud falle
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Error en el servidor. Por favor, intenta de nuevo más tarde.',
          buttons: ['OK'],
        });
        await alert.present();
        console.error('Error en el inicio de sesión:', error);
      }
    );
  }

  recoveryPassword() { 
    // metodo para recuperar la del username en realidad para ocuparlo en recuperar contraseña
    this.router.navigate(['/recuperar'], 
      { queryParams: { username: this.correo } });
  }


    // Método para mostrar alerta
    async presentAlert(message: string) {
      const alert = await this.alertController.create({
        header: 'Alerta',
        subHeader: '',
        message: message,
        buttons: ['OK'],
      });
      await alert.present();
    }

    
}