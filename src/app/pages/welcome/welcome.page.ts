import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  cursos: any[] = [];
  userId: string | null = '';  
  nombreCompleto: string = '';
  perfil: string = '';
  nombre: string = '';
  correoUsuario: string = '';  
  imgPerfil: string = '';  
  cursoID: string = '';
  codigoMatriculaQR: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private menu: MenuController,
    private authService: AuthService,
    private alertController: AlertController,
  ) { }

  async ngOnInit() {
    try {
      // Obtener y mostrar el token de autenticación
      const token = await this.authService.getToken();
      console.log('Token de autenticación:', token); 
  
      // Obtener la información del usuario
      const userInfo = await this.authService.getUserInfo();
      userInfo.subscribe(
        (response: any) => {
          console.log('Información del usuario:', response);

          this.nombreCompleto = response.data?.nombre_completo || 'Usuario';
          this.perfil = response.data?.perfil || 'No definido';
          this.correoUsuario = response.data?.correo || 'No disponible';
          this.imgPerfil = response.data?.img || '';
          this.nombre = response.data?.nombre || 'Invitado';

          console.log('Correo:', this.correoUsuario);
          console.log('Nombre completo:', this.nombreCompleto);
          console.log('Perfil:', this.perfil);

          if (this.correoUsuario) {
            this.obtenerCursosPorCorreo(this.correoUsuario);
          }
        },
        (error: any) => {
          console.error('Error al obtener la información del usuario:', error);
        }
      );
    } catch (error) {
      console.error('Error en el proceso de autenticación:', error);
    }
  }

  async obtenerCursosPorCorreo(correo: string) {
    try {
      const cursosObs = await this.authService.getCursosPorCorreo(correo);
      const response = await cursosObs.toPromise();
      console.log('Cursos obtenidos:', response);

      if (response && response.cursos) {
        this.cursos = response.cursos.map((curso: any) => ({
          ...curso,
          codigo_matricula: curso.codigo_matricula ? String(curso.codigo_matricula) : 'Sin código',
        }));
        console.log('Lista de cursos:', this.cursos);
      } else {
        console.warn('No se encontraron cursos para este correo.');
      }
    } catch (error) {
      console.error('Error al obtener los cursos por correo:', error);
    }
  }

  verDetallesCurso(curso: any) {
    const userInfo = {
      nombreCompleto: this.nombreCompleto,
      perfil: this.perfil,
      imgPerfil: this.imgPerfil,
    };
  
    // Navegar a la página de detalles con los datos del curso y del usuario
    this.router.navigate(['/detalle', curso.id], {
      state: { curso, userInfo },
    });
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

  openMenu() {
    this.menu.open();
  }

  async crearCurso() {
    const alert = await this.alertController.create({
      header: 'Crear nuevo curso',
      inputs: [
        { name: 'nombre', type: 'text', placeholder: 'Nombre del curso' },
        { name: 'sigla', type: 'text', placeholder: 'Sigla del curso' },
        { name: 'institucion', type: 'text', placeholder: 'Institución' },
        { name: 'descripcion', type: 'textarea', placeholder: 'Descripción del curso' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: (data) => {
            this.enviarDatosCurso(data);
          }
        }
      ]
    });

    await alert.present();
  }

  async enviarDatosCurso(data: any) {
    try {
      const cursoObs = await this.authService.crearCurso(data);
      cursoObs.subscribe(
        async (response: any) => {
          console.log('Curso creado exitosamente:', response);
          const nuevoCurso = response.data;
          this.cursos.push(nuevoCurso);
          this.codigoMatriculaQR = nuevoCurso.codigo_matricula;
          console.log('Código de Matrícula:', this.codigoMatriculaQR);
        },
        (error: any) => {
          console.error('Error al crear el curso:', error);
        }
      );
    } catch (error) {
      console.error('Error en la creación del curso:', error);
    }
  }
}
