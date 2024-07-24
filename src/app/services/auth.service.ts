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

  constructor(private http: HttpClient) { }

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
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('expiresAt');
    this.loggedIn.next(false);
  }

  private isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('expiresAt');
    if (!expiresAt) return true;
    return new Date().getTime() > new Date(expiresAt).getTime();
  }
}
