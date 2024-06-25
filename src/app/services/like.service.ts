import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  private apiUrl = 'http://localhost:3000/api/likes'; // Ruta base del backend para likes

  constructor(private http: HttpClient) { }

  getLikesByRecipe(recipeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${recipeId}`);
  }

  getLikesCountByRecipe(recipeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${recipeId}/count`);
  }

  likeRecipe(recipeId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}`, { recipeId }, { headers });
  }

  unlikeRecipe(recipeId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}`, { headers, body: { recipeId } });
  }
}
