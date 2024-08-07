// recipe.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = 'https://apieasymenu.onrender.com/api/recipes';

  constructor(private http: HttpClient) { }

  createRecipe(recipeData: FormData, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl, recipeData, { headers }).pipe(
      tap(() => this.invalidateCache())
    );
  }

  getAllRecipes(timestamp?: number): Observable<any> {
    let params = new HttpParams();
    if (timestamp) {
      params = params.set('t', timestamp.toString());
    }
    return this.http.get(this.apiUrl, { params });
  }

  getRecipesByUser(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.get(`${this.apiUrl}/user`, { headers });
  }

  getRecipesByUserId(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  getRecipeById(recipeId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/${recipeId}`, { headers });
  }

  updateRecipe(recipeId: string, recipeData: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/${recipeId}`, recipeData, { headers }).pipe(
      tap(() => this.invalidateCache())
    );
  }

  deleteRecipe(recipeId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/${recipeId}`, { headers }).pipe(
      tap(() => this.invalidateCache())
    );
  }

  private invalidateCache(): void {
    // Aquí puedes implementar lógica para invalidar cualquier caché local
    // Por ejemplo, si estás usando localStorage:
    localStorage.removeItem('recipes');
  }
}
