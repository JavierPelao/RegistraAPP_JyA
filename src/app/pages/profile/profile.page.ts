import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, MenuController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { lastValueFrom } from 'rxjs';
import { Location } from '@angular/common';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  perfilData: any = {}; // Información completa del perfil
  nuevaContrasena: string = ''; // Nueva contraseña ingresada
  nombreCompleto: string = '';
  perfil: string = '';
  correoUsuario: string = '';
  imgPerfil: string = '';
  run: string = '';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private menu: MenuController,
    private authService: AuthService,
    private location: Location,
  ) {}

  async ngOnInit() {
    try {
      // Convertir el observable en una promesa con lastValueFrom
      const response = await lastValueFrom(await this.authService.getUserInfo());
      if (response?.data) {
        this.perfilData = response.data;
        this.nombreCompleto = this.perfilData.nombre_completo || 'Usuario';
        this.perfil = this.perfilData.perfil || 'No definido';
        this.correoUsuario = this.perfilData.correo || 'Correo no disponible';
        this.imgPerfil = this.perfilData.img || 'assets/img/default-profile.png';
        this.run = this.perfilData.run || 'RUN no disponible';
      } else {
        console.error('Error: La respuesta no contiene datos.');
      }
    } catch (error) {
      console.error('Error al cargar la información del perfil:', error);
    }
  }

  regresar() {
    // Si hay historial de navegación, vuelve atrás
    if (this.location.path() !== '') {
      this.location.back();
    } else {
      // En caso de que no haya historial, redirige a la ventana principal
      this.router.navigate(['/welcome']);
    }
  }
  
  async cambiarContrasena() {
    if (!this.nuevaContrasena) {
      this.mostrarAlerta('Error', 'Por favor, ingrese una nueva contraseña.');
      return;
    }

    try {
      // Convertir el observable en una promesa con lastValueFrom
      const response = await lastValueFrom(
        await this.authService.cambiarContrasena({ password: this.nuevaContrasena })
      );
      console.log('Contraseña cambiada exitosamente:', response);
      this.mostrarAlerta('Éxito', 'Contraseña cambiada exitosamente.');
      this.nuevaContrasena = ''; // Limpia el campo después del éxito
    } catch (error) {
      console.error('Error en el proceso de cambio de contraseña:', error);
      this.mostrarAlerta('Error', 'Hubo un problema al cambiar la contraseña.');
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

  openMenu() {
    this.menu.open();
  }
}
