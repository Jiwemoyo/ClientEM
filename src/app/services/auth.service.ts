import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  private logoutTimer: any;

  constructor(private http: HttpClient) {
    this.setLogoutTimer();
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, userData).pipe(
      tap((response: any) => {
        this.setSession(response);
      })
    );
  }

  logout(): void {
    this.clearSession();
  }

  getUserRole(): string {
    return localStorage.getItem('userRole') || '';
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  private hasToken(): boolean {
    return typeof localStorage !== 'undefined' && !!localStorage.getItem('token') && !this.isTokenExpired();
  }

  private setSession(authResult: any): void {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('userId', authResult.userId);
    localStorage.setItem('userRole', authResult.role);
    localStorage.setItem('expiresAt', authResult.expiresAt);
    this.loggedIn.next(true);
    this.setLogoutTimer();
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('expiresAt');
    this.loggedIn.next(false);
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
  }

  private isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('expiresAt');
    if (!expiresAt) return true;
    return new Date().getTime() > new Date(expiresAt).getTime();
  }

  private setLogoutTimer(): void {
    const expiresAt = localStorage.getItem('expiresAt');
    if (expiresAt) {
      const expiresIn = new Date(expiresAt).getTime() - new Date().getTime();
      if (this.logoutTimer) {
        clearTimeout(this.logoutTimer);
      }
      this.logoutTimer = setTimeout(() => {
        this.logout();
      }, expiresIn);
    }
  }
}
