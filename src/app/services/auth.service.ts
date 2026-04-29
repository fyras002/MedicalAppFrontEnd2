import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl="http://localhost:5039/api";
  constructor (private http:HttpClient,private router:Router){}
  
  login(username: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/Users/login`, { username, password });
  }
  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }
  getUser(): any {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }
  

}
