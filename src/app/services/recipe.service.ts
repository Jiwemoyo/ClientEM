// recipe.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = 'http://localhost:3000/api/recipes';

  constructor(private http: HttpClient) { }

  createRecipe(recipeData: FormData, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl, recipeData, { headers });
  }

  getAllRecipes(): Observable<any> {
    return this.http.get(this.apiUrl);
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
    return this.http.put(`${this.apiUrl}/${recipeId}`, recipeData, { headers });
  }

  deleteRecipe(recipeId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/${recipeId}`, { headers });
  }
}
