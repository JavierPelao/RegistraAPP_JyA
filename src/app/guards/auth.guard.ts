import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | Promise<boolean> {
    return this.authService.getToken().then(token => {
      if (token) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
    });
  }
}
