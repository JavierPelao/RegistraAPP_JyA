import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';
import { Location } from '@angular/common';

@Component({
  selector: 'app-detalle-est',
  templateUrl: './detalle-est.page.html',
  styleUrls: ['./detalle-est.page.scss'],
})
export class DetalleEstPage implements OnInit {
  curso: any;
  clases: any[] = [];
  anuncios: any[] = [];
  inasistencias: any[] = [];
  imgPerfil: string = ''; // Imagen de perfil
  nombreCompleto: string = ''; // Nombre completo del usuario
  perfil: string = ''; // Perfil del usuario

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private location: Location
  ) {
    // Recibe el estado pasado desde la página anterior
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.curso = navigation.extras.state['curso'];
      console.log('Datos del curso recibido en DetalleEstPage:', this.curso);
    }
  }

  ngOnInit() {
    const cursoId = this.curso?.id || this.route.snapshot.paramMap.get('id');
    console.log('ID del curso en DetalleEstPage:', cursoId);

    if (cursoId) {
      this.cargarDetalleCurso(cursoId);
      this.cargarAnunciosDelCurso(cursoId);
    }

    // Cargar información del usuario
    this.cargarDatosUsuario();
  }

  async cargarDatosUsuario() {
    try {
      const userInfo = await this.authService.getUserInfo();
      userInfo.subscribe(
        (response: any) => {
          console.log('Datos del usuario:', response); // Verifica la respuesta aquí
          this.imgPerfil = response?.data?.img || 'assets/img/default-user.png';
          this.nombreCompleto = response?.data?.nombre_completo || 'Usuario';
          this.perfil = response?.data?.perfil || 'Perfil no definido';
        },
        (error) => {
          console.error('Error al cargar los datos del usuario:', error);
        }
      );
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
    }
  }
  

  async cargarDetalleCurso(id: string) {
    try {
      const response = await this.authService.getCursoPorID(id);
      if (response && response.curso) {
        this.curso = response.curso;
      } else {
        console.error('La respuesta no contiene la información del curso esperada:', response);
      }
    } catch (error) {
      console.error('Error al solicitar los detalles del curso:', error);
    }
  }

  async cargarAnunciosDelCurso(cursoId: string) {
    console.log('Cargando anuncios para el curso con ID:', cursoId);
    try {
      const anuncios = await this.authService.getAnunciosPorCursoId(cursoId);
      if (anuncios && anuncios.length > 0) {
        this.anuncios = anuncios;
        console.log('Anuncios cargados:', this.anuncios);
      } else {
        console.log('No hay anuncios para este curso.');
        this.anuncios = [];
      }
    } catch (error) {
      console.error('Error al cargar los anuncios del curso:', error);
    }
  }

  async verDetallesAnuncio(anuncio: any) {
    const alert = await this.alertController.create({
      header: anuncio.titulo,
      message: anuncio.mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

  irACambiarContrasena() {
    console.log('Navegando a la página de cambiar contraseña');
    this.router.navigate(['/profile']);
  }

  cerrarSesion() {
    if (confirm('¿Desea cerrar sesión?')) {
      console.log('Sesión cerrada');
      this.router.navigate(['/login']);
    }
  }

  regresar() {
    console.log('Regresando a la página anterior');
    this.location.back();
  }
}
