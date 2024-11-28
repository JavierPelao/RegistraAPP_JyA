import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private authToken: string | null = null;

  constructor(private http: HttpClient, private storage: Storage) {
    this.storage.create();
  }

  private async getAuthHeaders(): Promise<HttpHeaders> {
    if (!this.authToken) {
      this.authToken = await this.storage.get('auth_token');
    }
    if (!this.authToken) {
      throw new Error('No authenticated');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    });
  }

  // Login
  login(correo: string, password: string): Observable<any> {
    const body = { correo, password };
    return this.http.post(`${this.apiUrl}/auth`, body).pipe(
      catchError((error) => {
        console.error('Error en login:', error);
        return throwError(() => new Error('Login failed'));
      })
    );
  }

  // Guardar y obtener token
  async saveToken(token: string): Promise<void> {
    await this.storage.set('auth_token', token);
  }

  async getToken(): Promise<string | null> {
    return await this.storage.get('auth_token');
  }

  // Obtener información del usuario
  async getUserInfo(): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/auth/me`, { headers });
  }

  async getUserId(): Promise<string | null> {
    return await this.storage.get('user_id');
  }

  // Obtener cursos inscritos por el estudiante
  async getCursosInscritosEstudiante(): Promise<{ message: string, cursos: any[] }> {
    const headers = await this.getAuthHeaders();
    const url = `${this.apiUrl}/estudiante/cursos`;
    return lastValueFrom(
      this.http.get<{ message: string, cursos: any[] }>(url, { headers }).pipe(
        catchError((error) => {
          console.error('Error obteniendo los cursos inscritos:', error);
          return throwError(() => new Error('Failed to fetch enrolled courses'));
        })
      )
    );
  }
  async getCursosPorCorreo(correo: string): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    const url = `${this.apiUrl}/cursos?correo=${correo}`;
    return this.http.get<any>(url, { headers }).pipe(
      catchError((error) => {
        console.error('Error obteniendo cursos por correo:', error);
        return throwError(() => new Error('Failed to fetch courses by email'));
      })
    );
  }

  // Registrar asistencia
  async registrarAsistencia(courseCode: string): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    const url = `${this.apiUrl}/clases/${courseCode}/asistencia`;
    return this.http.post(url, {}, { headers }).pipe(
      catchError((error) => {
        console.error('Error al registrar asistencia:', error);
        return throwError(() => new Error('Failed to register attendance'));
      })
    );
  }

  // Crear curso
  async crearCurso(data: any): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/cursos`, data, { headers }).pipe(
      catchError((error) => {
        console.error('Error al crear curso:', error);
        return throwError(() => new Error('Failed to create course'));
      })
    );
  }

  // Crear clase
  async crearClase(id: number, claseData: any): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    const url = `${this.apiUrl}/cursos/${id}/clase`;
    return this.http.post(url, claseData, { headers }).pipe(
      catchError((error) => {
        console.error('Error al crear clase:', error);
        return throwError(() => new Error('Failed to create class'));
      })
    );
  }

  // Crear anuncio
  async crearAnuncio(cursoId: string, data: { titulo: string; mensaje: string }): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    const url = `${this.apiUrl}/cursos/${cursoId}/anuncios`;
    return this.http.post(url, data, { headers }).pipe(
      catchError((error) => {
        console.error('Error al crear anuncio:', error);
        return throwError(() => new Error('Failed to create course announcement'));
      })
    );
  }

  // Obtener anuncios por curso
  async getAnunciosPorCursoId(cursoId: string): Promise<any[]> {
    const headers = await this.getAuthHeaders();
    const url = `${this.apiUrl}/cursos/${cursoId}/anuncios`;
    return lastValueFrom(
      this.http.get<any>(url, { headers }).pipe(
        map((response) => response.anuncios || []),
        catchError((error) => {
          console.error('Error obteniendo anuncios del curso:', error);
          return throwError(() => new Error('Failed to fetch course announcements'));
        })
      )
    );
  }

  // Cambiar contraseña
  async cambiarContrasena(data: { password: string }): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    const url = `${this.apiUrl}/usuarios/password`;
    return this.http.put(url, data, { headers }).pipe(
      catchError((error) => {
        console.error('Error al cambiar la contraseña:', error);
        return throwError(() => new Error('Failed to change password'));
      })
    );
  }

  // Reportar inasistencia
  async reportarInasistencia(cursoId: string, data: { fecha: string; mensaje: string }): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    const url = `${this.apiUrl}/cursos/${cursoId}/inasistencias`;
    return this.http.post(url, data, { headers }).pipe(
      catchError((error) => {
        console.error('Error al reportar inasistencia:', error);
        return throwError(() => new Error('Failed to report absence'));
      })
    );
  }

  // Obtener historial de asistencia
  async obtenerHistorialAsistencia(cursoId: number, codigoClase: string): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    const url = `${this.apiUrl}/cursos/${cursoId}/clase/${codigoClase}`;
    return this.http.get<any>(url, { headers }).pipe(
      catchError((error) => {
        console.error('Error al obtener el historial de asistencia:', error);
        return throwError(() => new Error('Failed to fetch attendance history'));
      })
    );
  }
 
  // Recuperar contraseña
  recuperarPassword(correo: string): Observable<any> {
    const body = { correo };
    return this.http.post(`${this.apiUrl}/recuperar`, body).pipe(
      catchError((error) => {
        console.error('Error al recuperar contraseña:', error);
        return throwError(() => new Error('Failed to recover password'));
      })
    );
  }
  
  // guardar y obtener perfil de usuario
  async saveUserProfile(perfil: string, nombreCompleto: string): Promise<void> {
    await this.storage.set('user_perfil', perfil);
    await this.storage.set('nombre_completo', nombreCompleto);
  }

  // Obtener perfil de usuario
  async getClasesPorCursoId(cursoId: string): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    const url = `${this.apiUrl}/cursos/${cursoId}/clase`;
    return this.http.get<any>(url, { headers });
  }

  // Obtener inasistencias por curso
  async getInasistenciasPorCursoId(cursoId: string): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    const url = `${this.apiUrl}/cursos/${cursoId}/inasistencias`;
    return this.http.get<any[]>(url, { headers });
  }
  
  // Obtener cursos por ID
  async getCursoPorID(cursoID: string): Promise<any> {
    const headers = await this.getAuthHeaders(); // Asegúrate de que este método esté bien definido
    const url = `${this.apiUrl}/cursos/${cursoID}`;
    return this.http.get<any>(url, { headers }).toPromise();
  }
  
}
