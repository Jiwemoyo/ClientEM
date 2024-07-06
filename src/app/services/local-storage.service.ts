import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private localStorageSupported: boolean | null = null;

  constructor() { }

  private checkLocalStorageSupport(): boolean {
    if (this.localStorageSupported !== null) {
      return this.localStorageSupported;
    }

    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      this.localStorageSupported = true;
    } catch (e) {
      this.localStorageSupported = false;
    }

    return this.localStorageSupported;
  }

  getItem(key: string): string | null {
    if (this.checkLocalStorageSupport()) {
      return localStorage.getItem(key);
    }
    return null;
  }

  setItem(key: string, value: string): void {
    if (this.checkLocalStorageSupport()) {
      localStorage.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    if (this.checkLocalStorageSupport()) {
      localStorage.removeItem(key);
    }
  }

  getUsername(): string | null {
    return this.getItem('username');
  }
}
