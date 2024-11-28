import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Location } from '@angular/common';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {
  curso: any;
  clases: any[] = [];
  anuncios: any[] = [];
  inasistencias: any[] = [];
  qrData: string = '';
  showQRCode: boolean = false;
  codigoQR: string = ''; // Variable para almacenar el contenido del QR (código_web)
  nombreCompleto: string = '';
  perfil: string = '';
  imgPerfil = '';
  correoUsuario = '';
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private alertController: AlertController,
    private location: Location,
    private router: Router,
    private menu: MenuController
  ) {}

  ngOnInit() {
    // Recuperar datos del curso y usuario desde el estado de navegación
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state as any;
      this.curso = state.curso; // Datos del curso
      this.nombreCompleto = state.userInfo?.nombreCompleto || 'Usuario';
      this.perfil = state.userInfo?.perfil || 'Perfil no definido';
      this.imgPerfil = state.userInfo?.imgPerfil || '';
    }
  
    // Si el curso tiene un ID, cargar detalles del curso
    if (this.curso?.id) {
      this.cargarDetalleCurso(this.curso.id);
      this.cargarAnunciosDelCurso(this.curso.id);
      this.cargarClasesDelCurso(this.curso.id);
    }
  }
  

  async cargarDetalleCurso(id: string) {
    try {
      const response = await this.authService.getCursoPorID(id);
      if (response && response.curso) {
        this.curso = response.curso;
        console.log('Información completa del curso:', this.curso);
      } else {
        console.error('La respuesta no contiene la información del curso esperada:', response);
      }
    } catch (error) {
      console.error('Error al solicitar los detalles del curso:', error);
    }
  }

  async cargarAnunciosDelCurso(cursoId: string) {
    try {
      console.log('Cargando anuncios para el curso con ID:', cursoId);
      const anuncios = await this.authService.getAnunciosPorCursoId(cursoId);
      this.anuncios = anuncios && anuncios.length > 0 ? anuncios : [];
      console.log(
        this.anuncios.length > 0 ? 'Anuncios cargados:' : 'No hay anuncios para este curso.',
        this.anuncios
      );
    } catch (error) {
      console.error('Error al cargar los anuncios del curso:', error);
    }
  }

  async cargarClasesDelCurso(id: string) {
    try {
      const clasesObs = await this.authService.getClasesPorCursoId(id);
      clasesObs.subscribe(
        (response: any) => {
          this.clases = response.clases || [];
          console.log('Datos de las clases:', this.clases);
          this.clases.forEach(clase =>
            console.log('Clase:', clase, 'Código web de la clase:', clase.codigo_web)
          );
        },
        error => console.error('Error al cargar las clases del curso:', error)
      );
    } catch (error) {
      console.error('Error al solicitar las clases del curso:', error);
    }
  }

  obtenerDiaSemana(fecha: string): string {
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fechaObj = new Date(fecha);
    return diasSemana[fechaObj.getUTCDay()];
  }

  async crearClase(cursoId: number) {
    const alert = await this.alertController.create({
      header: 'Crear Nueva Clase',
      inputs: [
        {
          name: 'fecha',
          type: 'date',
          placeholder: 'Fecha de la clase',
        },
        {
          name: 'horaInicio',
          type: 'time',
          placeholder: 'Hora de inicio',
        },
        {
          name: 'horaTermino',
          type: 'time',
          placeholder: 'Hora de término',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Crear',
          handler: async (data) => {
            console.log('Datos de la nueva clase:', data);
            const claseData = {
              fecha: data.fecha,
              hora_inicio: data.horaInicio,
              hora_termino: data.horaTermino,
            };

            try {
              const response = await this.authService.crearClase(cursoId, claseData);
              response.subscribe(
                (res: any) => {
                  console.log('Clase creada exitosamente:', res);
                  this.alertController
                    .create({
                      header: 'Éxito',
                      message: 'Clase creada exitosamente',
                      buttons: ['OK'],
                    })
                    .then((alertEl) => alertEl.present());

                  // Refresca la lista de clases
                  this.cargarClasesDelCurso(cursoId.toString());
                },
                (err) => {
                  console.error('Error al crear la clase:', err);
                }
              );
            } catch (error) {
              console.error('Error en la creación de la clase:', error);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async verDetallesAnuncio(anuncio: any) {
    const alert = await this.alertController.create({
      header: anuncio.titulo,
      message: anuncio.mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

  verDetallesClase(cursoId: number, clase: any) {
    if (clase && clase.codigo_web) {
      console.log('Código web de la clase:', clase.codigo_web);
      this.router.navigate([`/detalle/${cursoId}/clase/${clase.codigo_web}`], {
        state: { cursoId, codigo_web: clase.codigo_web },
      });
    } else {
      console.error('El código web de la clase no está definido:', clase);
    }
  }

  mostrarQRCode(codigoWeb: string) {
    if (codigoWeb) {
      this.codigoQR = codigoWeb; // Asigna el código web de la clase al contenido del QR
      this.showQRCode = true; // Muestra el QR en la interfaz
      console.log('Código QR generado:', this.codigoQR);
    } else {
      console.error('El código web de la clase no está definido.');
    }
  }

  cerrarQRCode() {
    this.showQRCode = false; // Oculta el QR
    this.codigoQR = ''; // Limpia el contenido del QR
  }

  async crearAnuncio(cursoId: string) {
    const alert = await this.alertController.create({
      header: 'Crear Anuncio del Curso',
      inputs: [
        {
          name: 'titulo',
          type: 'text',
          placeholder: 'Título del anuncio',
        },
        {
          name: 'mensaje',
          type: 'textarea',
          placeholder: 'Mensaje del anuncio',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Creación de anuncio cancelada');
          },
        },
        {
          text: 'Crear',
          handler: async (data) => {
            if (data.titulo && data.mensaje) {
              try {
                const response = await this.authService.crearAnuncio(cursoId, data);
                response.subscribe(
                  (res) => {
                    console.log('Anuncio creado exitosamente:', res);
                  },
                  (err) => {
                    console.error('Error al crear el anuncio:', err);
                  }
                );
              } catch (error) {
                console.error('Error en la creación del anuncio:', error);
              }
            } else {
              console.error('El título y el mensaje son obligatorios');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  regresar() {
    this.location.back();
  }

  openMenu() {
    this.menu.open();
  }
  closeMenu() {
    this.menu.close();
  }
  

  irACambiarContrasena() {
    this.router.navigate(['/profile'], {
      state: {
        userData: {
          nombreCompleto: this.nombreCompleto,
          perfil: this.perfil,
          correoUsuario: this.correoUsuario,
          imgPerfil: this.imgPerfil,
        },
      },
    });
  }
  cerrarSesion() {
    if (confirm('¿Desea cerrar sesión?')) {
      this.router.navigate(['/login']);
    }
  }
}
