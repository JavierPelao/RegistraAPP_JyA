import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard'; // Asegúrate de estar importando AuthGuard correctamente
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;  // Variable para la instancia del guard
  let authServiceSpy: jasmine.SpyObj<AuthService>;  // Spy para AuthService
  let routerSpy: jasmine.SpyObj<Router>;  // Spy para Router

  beforeEach(() => {
    const spyAuthService = jasmine.createSpyObj('AuthService', ['getToken']);
    const spyRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: spyAuthService },
        { provide: Router, useValue: spyRouter }
      ]
    });

    authGuard = TestBed.inject(AuthGuard);  // Inyectamos AuthGuard
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(authGuard).toBeTruthy();
  });

  it('should return true if token exists', async () => {
    authServiceSpy.getToken.and.returnValue(Promise.resolve('fake-token'));
    const result = await authGuard.canActivate();
    expect(result).toBe(true);
  });

  it('should navigate to login if token does not exist', async () => {
    authServiceSpy.getToken.and.returnValue(Promise.resolve(null));
    const result = await authGuard.canActivate();
    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });
});
