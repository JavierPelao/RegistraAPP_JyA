import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Location } from '@angular/common';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-clase',
  templateUrl: './clase.page.html',
  styleUrls: ['./clase.page.scss'],
})
export class ClasePage implements OnInit {
  cursoId: number | null = null;
  codigoClase: string = '';
  asistencia: any[] = [];
  claseInfo: any;
  totalAsistencias: number = 0;
  mensaje: string = '';
  
  // Información del usuario logueado
  imgPerfil: string = ''; 
  nombreCompleto: string = '';
  perfil: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService, // Servicio de autenticación
    private location: Location,
    private menu: MenuController
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.cursoId = navigation.extras.state['cursoId'];
      this.codigoClase = navigation.extras.state['codigo_web'];
      console.log('ID del curso recibido en ClasePage:', this.cursoId);
      console.log('Código de clase recibido en ClasePage:', this.codigoClase);
    }
  }

  ngOnInit() {
    const cursoIdParam = this.route.snapshot.paramMap.get('id');
    const codigoClaseParam = this.route.snapshot.paramMap.get('codigo');

    if (cursoIdParam) this.cursoId = Number(cursoIdParam);
    if (codigoClaseParam) this.codigoClase = codigoClaseParam;

    if (this.cursoId !== null && this.codigoClase) {
      this.cargarHistorialAsistencia(this.cursoId, this.codigoClase);
    } else {
      console.warn('cursoId o código de clase no está definido correctamente');
    }

    // Cargar datos del usuario logueado
    this.cargarDatosUsuario();
  }

  async cargarDatosUsuario() {
    try {
      const userInfoObs = await this.authService.getUserInfo(); // Método que retorna los datos del usuario
      userInfoObs.subscribe(
        (response: any) => {
          console.log('Datos del usuario logueado:', response);
          this.nombreCompleto = response.data?.nombre_completo || 'Usuario';
          this.perfil = response.data?.perfil || 'Perfil no definido';
          this.imgPerfil = response.data?.img || 'assets/img/default-user.png'; // Imagen por defecto
        },
        (error) => {
          console.error('Error al cargar los datos del usuario:', error);
        }
      );
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
    }
  }

  async cargarHistorialAsistencia(cursoId: number, codigoClase: string) {
    try {
      const asistenciaObs = await this.authService.obtenerHistorialAsistencia(cursoId, codigoClase);
      asistenciaObs.subscribe(
        (response: any) => {
          this.mensaje = response.message;
          this.claseInfo = response.clase;
          this.totalAsistencias = response.total;
          this.asistencia = response.asistencias;
        },
        (error) => {
          console.error('Error al cargar el historial de asistencia:', error);
        }
      );
    } catch (error) {
      console.error('Error al solicitar el historial de asistencia:', error);
    }
  }

  regresar() {
    this.location.back();
  }

  openMenu() {
    this.menu.open();
  }

  irACambiarContrasena() {
    this.router.navigate(['/profile']);
  }

  cerrarSesion() {
    if (confirm('¿Desea cerrar sesión?')) {
      this.router.navigate(['/login']);
    }
  }
}
