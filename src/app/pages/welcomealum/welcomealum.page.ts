import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Browser } from '@capacitor/browser';
import { Router } from '@angular/router';

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
  scannedData: any;
  result: string = ''; // Declarada para la plantilla

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      const token = await this.authService.getToken();
      console.log('Token de autenticación:', token);

      const userInfo = await this.authService.getUserInfo();
      userInfo.subscribe(
        async (response: any) => {
          this.nombreCompleto = response.data.nombre_completo;
          this.perfil = response.data.perfil;
          this.correoUsuario = response.data.correo;
          this.imgPerfil = response.data.img;
          this.nombre = response.data.nombre;

          if (this.correoUsuario) {
            await this.getCursosInscritos();
          }
        },
        (error: any) => console.error('Error al obtener la información del usuario:', error)
      );
    } catch (error) {
      console.error('Error en el proceso de autenticación o carga de cursos:', error);
    }
  }

  async getCursosInscritos() {
    try {
      const response = await this.authService.getCursosInscritosEstudiante();
      console.log('Cursos inscritos obtenidos:', response);

      if (response && response['cursos']) {
        this.cursos = response['cursos'];
      } else {
        console.error('La respuesta no contiene la propiedad cursos');
        this.cursos = [];
      }
    } catch (error) {
      console.error('Error al obtener los cursos inscritos:', error);
      this.cursos = [];
    }
  }

  cerrarSesion() {
    if (confirm('¿Desea cerrar sesión?')) {
      this.router.navigate(['/login']);
    }
  }

  irACambiarContrasena() {
    // Navega a la página de cambio de contraseña
    this.router.navigate(['/profile']);
  }

  verDetallesCurso(curso: any) {
    // Navega a los detalles del curso pasando el ID del curso
    console.log('ID del curso seleccionado:', curso.id);
    this.router.navigate(['/detalle-est', curso.id], { state: { curso: curso } });
  }

  async scanQRCode() {
    BarcodeScanner.checkPermission({ force: true }).then((status) => {
      if (status.granted) {
        BarcodeScanner.hideBackground();
        BarcodeScanner.startScan().then(async (result) => {
          BarcodeScanner.showBackground();
          if (result.hasContent) {
            console.log('QR Code data:', result.content);
            this.scannedData = result.content;

            if (this.isValidURL(result.content)) {
              let url = result.content.trim();
              if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
              }
              await Browser.open({ url });
            } else {
              console.log('Contenido escaneado no es una URL. Intentando registrar en clase...');
              await this.matricularEnCurso(result.content);
            }
          } else {
            this.showScanResult('No se encontró contenido en el código QR.');
          }
        }).catch((err) => {
          console.error('Error al escanear QR:', err);
          BarcodeScanner.showBackground();
        });
      } else {
        console.log('Permiso denegado para usar la cámara.');
      }
    });
  }

  async showScanResult(data: string) {
    const alert = await this.alertController.create({
      header: 'QR Code Scanned',
      message: `Data: ${data}`,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async matricularEnCurso(courseCode: string) {
    try {
      (await this.authService.registrarAsistencia(courseCode)).subscribe(
        (response) => {
          console.log('Enrolled successfully:', response);
          this.showScanResult('Enrolled successfully in course: ' + courseCode);
        },
        (error) => {
          console.error('Error enrolling in course:', error);
          this.showScanResult('Failed to enroll in course: ' + courseCode);
        }
      );
    } catch (error) {
      console.error('Error en el proceso de matrícula:', error);
    }
  }

  isValidURL(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  async mostrarInputCodigoCurso() {
    const alert = await this.alertController.create({
      header: 'Inscribirse en Curso',
      inputs: [
        {
          name: 'codigo',
          type: 'text',
          placeholder: 'Ingrese el código del curso',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Inscripción cancelada');
          },
        },
        {
          text: 'Inscribirse',
          handler: (data) => {
            if (data.codigo) {
              this.matricularEnCurso(data.codigo);
            } else {
              console.error('El código está vacío.');
            }
          },
        },
      ],
    });

    await alert.present();
  }
}
