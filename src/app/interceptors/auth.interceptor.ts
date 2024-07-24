import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LocalStorageService } from '../services/local-storage.service';
import { Router } from '@angular/router'; // Importa Router

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private localStorageService: LocalStorageService, private router: Router) {} // Inyecta Router

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.localStorageService.getItem('token');

    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.error('Acceso no autorizado, token inválido o faltante');
            this.localStorageService.removeItem('token'); // Elimina el token
            this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
          }
          return throwError(error);
        })
      );
    } else {
      return next.handle(req);
    }
  }
}
