import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private loggedIn = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loggedIn.next(this.hasToken());
    }
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
    return this.getItem('userRole') || '';
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  private hasToken(): boolean {
    return !!this.getItem('token') && !this.isTokenExpired();
  }

  private setSession(authResult: any): void {
    this.setItem('token', authResult.token);
    this.setItem('userId', authResult.userId);
    this.setItem('userRole', authResult.role);
    this.setItem('expiresAt', authResult.expiresAt);
    this.loggedIn.next(true);
  }

  private clearSession(): void {
    this.removeItem('token');
    this.removeItem('userId');
    this.removeItem('userRole');
    this.removeItem('expiresAt');
    this.loggedIn.next(false);
  }

  private isTokenExpired(): boolean {
    const expiresAt = this.getItem('expiresAt');
    if (!expiresAt) return true;
    return new Date().getTime() > new Date(expiresAt).getTime();
  }

  private setItem(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    }
  }

  private getItem(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key);
    }
    return null;
  }

  private removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    }
  }
}
