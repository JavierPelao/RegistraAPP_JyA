import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-clase',
  templateUrl: './clase.page.html',
  styleUrls: ['./clase.page.scss'],
})
export class ClasePage implements OnInit {
  cursoId: number | null = null; // Inicializado con null para evitar el error
  codigoClase: string = ''; // Código web recibido desde detalle
  asistencia: any[] = [];
  claseInfo: any;
  totalAsistencias: number = 0;
  mensaje: string = '';

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService) {
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
    const codigoClaseParam = this.route.snapshot.paramMap.get('codigo'); // Asegúrate de que el nombre del parámetro coincida
  
    console.log('Parámetro cursoId:', cursoIdParam);
    console.log('Parámetro códigoClase:', codigoClaseParam);
  
    if (cursoIdParam) {
      this.cursoId = Number(cursoIdParam);
      console.log('cursoId asignado:', this.cursoId);
    }
    if (codigoClaseParam) {
      this.codigoClase = codigoClaseParam;
      console.log('Código de clase asignado:', this.codigoClase);
    }
  
    if (this.cursoId !== null && this.codigoClase) {
      this.cargarHistorialAsistencia(this.cursoId, this.codigoClase);
    } else {
      console.warn('cursoId o código de clase no está definido correctamente');
    }
  }
  

  async cargarHistorialAsistencia(cursoId: number, codigoClase: string) {
    console.log('Cargando historial de asistencia para cursoId:', cursoId, 'y códigoClase:', codigoClase);
    try {
        // No conviertas `codigoClase` a un número, úsalo como string
        const asistenciaObs = await this.authService.obtenerHistorialAsistencia(cursoId, codigoClase);
        asistenciaObs.subscribe(
            (response: any) => {
                console.log('Respuesta de asistencia:', response);
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

}
