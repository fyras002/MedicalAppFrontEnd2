import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const expectedRole = route.data['role'] as number;
    
    if (user && user.role === expectedRole) {
      return true;
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}