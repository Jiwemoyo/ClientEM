import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'https://apieasymenu.onrender.com/api/comments';

  constructor(private http: HttpClient) { }

  createComment(commentData: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl, commentData, { headers });
  }
  getCommentsByRecipe(recipeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${recipeId}`);
  }

  updateComment(commentId: string, commentData: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/${commentId}`, commentData, { headers });
  }

  deleteComment(commentId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/${commentId}`, { headers });
  }
}
