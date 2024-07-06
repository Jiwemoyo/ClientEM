import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  constructor() { }

  private isLocalStorageSupported(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  getItem(key: string): string | null {
    if (this.isLocalStorageSupported()) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.error('Error al obtener item de localStorage:', e);
        return null;
      }
    } else {
      console.error('localStorage no soportado en este navegador.');
      return null;
    }
  }

  setItem(key: string, value: string): void {
    if (this.isLocalStorageSupported()) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('Error al establecer item en localStorage:', e);
      }
    } else {
      console.error('localStorage no soportado en este navegador.');
    }
  }

  removeItem(key: string): void {
    if (this.isLocalStorageSupported()) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Error al remover item de localStorage:', e);
      }
    } else {
      console.error('localStorage no soportado en este navegador.');
    }
  }

  getUsername(): string | null {
    return this.getItem('username');
  }
}
