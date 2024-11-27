import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://www.presenteprofe.cl/api/v1';  // Ajuste para evitar la barra adicional

  constructor(private http: HttpClient, private storage: Storage) {
    this.storage.create();
  }

  private async getAuthHeaders(): Promise<HttpHeaders> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('No authenticated');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  login(correo: string, password: string): Observable<any> {
    const body = { correo, password };
    return this.http.post(`${this.apiUrl}/auth`, body).pipe(
      tap(async (response: any) => {
        if (response.data) {
          if (response.auth?.token) {
            await this.storage.set('auth_token', response.auth.token);
          }
          await this.storage.set('user_id', response.data.id);
          await this.storage.set('user_perfil', response.data.perfil);
          await this.storage.set('nombre_completo', response.data.nombre_completo);
        }
      }),
      catchError((error) => {
        console.error('Error en login:', error);
        if (error.status === 0) {
          console.error('Network error: Please check if the backend server is running and accessible.');
        } else if (error.status === 404) {
          console.error('Invalid credentials provided.');
        } else if (error.status === 500) {
          console.error('Server error, please try again later.');
        }
        return throwError(() => new Error('Failed to log in'));
      })
    );
  }

  async saveToken(token: string): Promise<void> {
    localStorage.setItem('authToken', token);
  }

  async getToken(): Promise<string | null> {
    return await this.storage.get('auth_token');
  }

  recuperarPassword(correo: string): Observable<any> {
    const body = { correo };
    return this.http.post(`${this.apiUrl}/recuperar`, body).pipe(
      catchError((error) => {
        console.error('Error al recuperar contraseña:', error);
        return throwError(() => new Error('Failed to recover password'));
      })
    );
  }

  async saveUserProfile(perfil: string, nombre_completo: string): Promise<void> {
    await this.storage.set('user_perfil', perfil);
    await this.storage.set('nombre_completo', nombre_completo);
  }

  async getUserInfo(): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/auth/me`, { headers }).pipe(
      catchError((error) => {
        console.error('Error obteniendo información del usuario:', error);
        return throwError(() => new Error('Failed to fetch user info'));
      })
    );
  }

  async getUserId(): Promise<string | null> {
    return await this.storage.get('user_id');
  }

  async getCursosPorCorreo(correo: string): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/cursos`, { headers }).pipe(
      catchError((error) => {
        console.error('Error obteniendo cursos por correo:', error);
        return throwError(() => new Error('Failed to fetch courses'));
      })
    );
  }

  async getCursoInscritoPorId(cursoId: string): Promise<any> {
    const headers = await this.getAuthHeaders();
    const url = `${this.apiUrl}/estudiante/cursos/${cursoId}`;
    return lastValueFrom(
      this.http.get<any>(url, { headers }).pipe(
        catchError((error) => {
          console.error('Error obteniendo el curso inscrito por ID:', error);
          return throwError(() => new Error('Failed to fetch enrolled course by ID'));
        })
      )
    );
  }

  async crearCurso(data: any): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/cursos`, data, { headers }).pipe(
      catchError((error) => {
        console.error('Error al crear curso:', error);
        return throwError(() => new Error('Failed to create course'));
      })
    );
  }

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

  async getCursoPorID(cursoID: string): Promise<any> {
    const headers = await this.getAuthHeaders();
    return lastValueFrom(
      this.http.get(`${this.apiUrl}/cursos/${cursoID}`, { headers }).pipe(
        catchError((error) => {
          console.error('Error obteniendo curso por ID:', error);
          return throwError(() => new Error('Failed to fetch course by ID'));
        })
      )
    );
  }

  async getCursosEstudianteMatriculados(cursoID: string, userId: string): Promise<any> {
    const headers = await this.getAuthHeaders();
    return lastValueFrom(
      this.http.get(`${this.apiUrl}/estudiante/${userId}/cursos/${cursoID}`, { headers }).pipe(
        catchError((error) => {
          console.error('Error obteniendo curso por ID:', error);
          return throwError(() => new Error('Failed to fetch course by ID'));
        })
      )
    );
  }

  async matricularseEnCurso(codigoCurso: string): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    const body = { codigoCurso };
    const url = `${this.apiUrl}/cursos/matricular`;
    return this.http.post(url, body, { headers }).pipe(
      catchError((error) => {
        console.error('Error al matricularse en el curso:', error);
        return throwError(() => new Error('Failed to enroll in course'));
      })
    );
  }

  async registrarAsistencia(codigoCurso: string): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    const url = `${this.apiUrl}/clases/${codigoCurso}/asistencia`;
    return this.http.post(url, {}, { headers }).pipe(
      catchError((error) => {
        console.error('Error al unirse al curso:', error);
        return throwError(() => new Error('Failed to join course'));
      })
    );
  }

  async getClasesPorCursoId(cursoId: number | string): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/cursos/${cursoId}/clase`, { headers }).pipe(
      catchError((error) => {
        console.error('Error obteniendo las clases del curso:', error);
        return throwError(() => new Error('Failed to fetch classes for the course'));
      })
    );
  }

  // En AuthService
  async obtenerHistorialAsistencia(cursoId: number, codigoClase: string): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders(); // Asegúrate de que este método devuelva los encabezados correctos con el token de autorización
    const url = `${this.apiUrl}/cursos/${cursoId}/clase/${codigoClase}`;
    return this.http.get<any>(url, { headers }).pipe(
      catchError((error) => {
        console.error('Error al obtener el historial de asistencia:', error);
        return throwError(() => new Error('Failed to fetch attendance history'));
      })
    );
  }
  

  //anuncio 
  async crearAnuncio(cursoId: string, data: { titulo: string; mensaje: string }): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    const url = `${this.apiUrl}/cursos/${cursoId}/anuncios`; // URL basada en la imagen que compartiste
    return this.http.post(url, data, { headers }).pipe(
      catchError((error) => {
        console.error('Error al crear anuncio del curso:', error);
        return throwError(() => new Error('Failed to create course announcement'));
      })
    );
  }

  async getAnunciosPorCursoId(cursoId: string): Promise<any[]> {
    const headers = await this.getAuthHeaders();
    const url = `https://www.presenteprofe.cl/api/v1/cursos/${cursoId}/anuncios`;
    return lastValueFrom(
      this.http.get<any>(url, { headers }).pipe(
        map((response) => response.anuncios || []),
        catchError((error) => {
          console.error('Error obteniendo anuncios del curso:', error);
          if (error.status === 404) {
            console.error('Curso no encontrado.');
          }
          return throwError(() => new Error('Failed to fetch course announcements'));
        })
      )
    );
  }



  async getCursosInscritosEstudiante(): Promise<{ message: string, cursos: any[] }> {
    const headers = await this.getAuthHeaders();
    const url = `${this.apiUrl}/estudiante/cursos`;
    return lastValueFrom(
      this.http.get<{ message: string, cursos: any[] }>(url, { headers }).pipe(
        catchError((error) => {
          console.error('Error obteniendo los cursos inscritos del estudiante:', error);
          return throwError(() => new Error('Failed to fetch enrolled courses'));
        })
      )
    );
  }

  async reportarInasistencia(cursoId: string, data: { fecha: string; mensaje: string }): Promise<Observable<any>> {
    const headers = await this.getAuthHeaders();
    const url = `${this.apiUrl}/estudiante/cursos/${cursoId}/reportar-inasistencia`;
    return this.http.post(url, data, { headers }).pipe(
      catchError((error) => {
        console.error('Error al reportar inasistencia:', error);
        return throwError(() => new Error('Failed to report absence'));
      })
    );
  }

  async getInasistenciasPorCursoId(cursoId: string) {
    const headers = await this.getAuthHeaders(); // Espera a que el `Promise` se resuelva
    const url = `https://www.presenteprofe.cl/api/v1/cursos/${cursoId}/inaistencias`;
    return this.http.get<any[]>(url, { headers }).pipe(
      catchError((error) => {
        console.error('Error obteniendo inasistencias del curso:', error);
        return throwError(() => new Error('Failed to fetch absences for the course'));
      })
    );
  }
  
  

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



}
