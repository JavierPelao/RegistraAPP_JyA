import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { QrScannerService } from '../../services/qr-scanner-service.service';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-welcomealum',
  templateUrl: './welcomealum.page.html',
  styleUrls: ['./welcomealum.page.scss'],
})
export class WelcomealumPage implements OnInit {
  cursos: any[] = [];
  userId: string | null = '';
  nombreCompleto: string = '';
  perfil: string = '';
  nombre: string = '';
  correoUsuario: string = '';
  imgPerfil: string = '';
  cursoID: string = '';
  codigo_web: string = ''; // Código escaneado
  scannedData: any;

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router,
    private qrScannerService: QrScannerService
  ) { }

  async ngOnInit() {
    try {
      await this.qrScannerService.init(); // Inicializa el servicio del escáner
      const token = await this.authService.getToken();
      console.log('Token de autenticación:', token);

      const userInfo = await this.authService.getUserInfo();
      userInfo.subscribe(
        async (response: any) => {
          console.log('Información del usuario:', response);

          this.nombreCompleto = response.data.nombre_completo || 'No definido';
          this.perfil = response.data.perfil || 'No definido';
          this.nombre = response.data.nombre || 'No definido';
          this.imgPerfil = response.data.img || '';

          if (response.data.correo) {
            this.correoUsuario = response.data.correo;
            await this.getCursosInscritos();
          } else {
            console.error('El correo no está disponible.');
          }
        },
        (error: any) => {
          console.error('Error al obtener información del usuario:', error);
        }
      );
    } catch (error) {
      console.error('Error en el proceso de autenticación o carga de datos:', error);
    }
  }

  // Escanea un QR y registra la asistencia
  async scan() {
    try {
      const results = await this.qrScannerService.scan(); // Escanea el QR

      if (results.length > 0) {
        const scannedContent = results[0]; // Obtén el primer resultado del escáner
        console.log('Contenido escaneado:', scannedContent);

        if (this.isValidURL(scannedContent)) {
          await this.openInBrowser(scannedContent); // Abre el navegador si es una URL
        } else {
          await this.registrarAsistencia(scannedContent); // Registra asistencia si es un código
        }
      } else {
        await this.showAlert('Error', 'No se detectó contenido en el QR.');
      }
    } catch (error) {
      console.error('Error al escanear el QR:', error);
      await this.showAlert('Error', 'Hubo un problema al escanear el QR.');
    }
  }

  // Registra la asistencia
  async registrarAsistencia(codigo_web: string) {
    try {
      console.log(`Registrando asistencia para el código: ${codigo_web}`);
      const observable = await this.authService.registrarAsistencia(codigo_web);

      observable.subscribe(
        async (response) => {
          console.log('Asistencia registrada exitosamente:', response);
          await this.showAlert('Éxito', `Te has registrado correctamente en el curso: ${codigo_web}`);
        },
        async (error) => {
          console.error('Error al registrar la asistencia:', error);
          await this.showAlert('Error', 'No se pudo registrar la asistencia. Verifica el código.');
        }
      );
    } catch (error) {
      console.error('Error al registrar la asistencia:', error);
      await this.showAlert('Error', 'Hubo un problema al registrar la asistencia.');
    }
  }

  // Abre una URL en el navegador
  async openInBrowser(url: string) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    await Browser.open({ url });
  }

  // Muestra una alerta
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  // Valida si el contenido escaneado es una URL
  isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }


  async getCursosInscritos() {
    try {
      const response = await this.authService.getCursosInscritosEstudiante();
      console.log('Cursos inscritos:', response);

      if (response && response.cursos) {
        this.cursos = response.cursos;
      } else {
        console.error('No hay cursos disponibles.');
      }
    } catch (error) {
      console.error('Error al obtener los cursos inscritos:', error);
    }
  }

  cerrarSesion() {
    if (confirm('¿Desea cerrar sesión?')) {
      this.router.navigate(['/login']);
    }
  }

  irACambiarContrasena() {
    this.router.navigate(['/profile']);
  }

  verDetallesCurso(curso: any) {
    this.router.navigate(['/detalle-est', curso.id], { state: { curso: curso } });
  }
}
