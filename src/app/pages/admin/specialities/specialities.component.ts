import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-specialities',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './specialities.component.html',
  styleUrls: ['./specialities.component.scss']
})
export class AdminSpecialitiesComponent implements OnInit {
  specialities: any[] = [];
  showForm = false;
  showNotifications = false;
  showProfileMenu = false;
  adminName = 'Admin User';
  adminEmail = 'admin@medicalapp.com';
  newSpeciality = { specialityName: null, description: '' };
  private baseUrl = 'http://localhost:5039/api';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    if (user.firstname) {
      this.adminName = `${user.firstname} ${user.lastname}`;
      this.adminEmail = user.email || 'admin@medicalapp.com';
    }
    this.loadSpecialities();
  }

  loadSpecialities() {
    this.http.get<any[]>(`${this.baseUrl}/Specialities`).subscribe({
      next: (data) => {
        this.specialities = data;
        this.cdr.detectChanges();
      }
    });
  }

  createSpeciality() {
    this.http.post(`${this.baseUrl}/Specialities`, this.newSpeciality).subscribe({
      next: () => {
        this.showForm = false;
        this.newSpeciality = { specialityName: null, description: '' };
        this.loadSpecialities();
      }
    });
  }

  deleteSpeciality(id: number) {
    if (confirm('Delete this speciality?')) {
      this.http.delete(`${this.baseUrl}/Specialities/${id}`).subscribe({
        next: () => this.loadSpecialities(),
        error: () => alert('Cannot delete. It may have doctors linked.')
      });
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) this.showProfileMenu = false;
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) this.showNotifications = false;
  }

  logout() {
    this.authService.logout();
  }
}