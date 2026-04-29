import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.scss']
})
export class AdminDoctorsComponent implements OnInit {
  doctors: any[] = [];
  specialities: any[] = [];
  showForm = false;
  showNotifications = false;
  showProfileMenu = false;
  adminName = 'Admin User';
  adminEmail = 'admin@medicalapp.com';
  private baseUrl = 'http://localhost:5039/api';

  newDoctor = {
    username: '', email: '', password: '', firstname: '', lastname: '',
    specialityId: null, licenseNumber: '', biography: '', yearsOfExperience: null
  };

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
    this.loadDoctors();
    this.loadSpecialities();
  }

  loadDoctors() {
    this.http.get<any[]>(`${this.baseUrl}/Doctors`).subscribe(d => {
      this.doctors = d;
      this.cdr.detectChanges();
    });
  }

  loadSpecialities() {
    this.http.get<any[]>(`${this.baseUrl}/Specialities`).subscribe(s => {
      this.specialities = s;
      this.cdr.detectChanges();
    });
  }

  createDoctor() {
    this.http.post(`${this.baseUrl}/Users`, {
      username: this.newDoctor.username, email: this.newDoctor.email,
      password: this.newDoctor.password, firstname: this.newDoctor.firstname,
      lastname: this.newDoctor.lastname, role: 2
    }).subscribe({
      next: (user: any) => {
        this.http.post(`${this.baseUrl}/Doctors`, {
          userId: user.id, specialityId: this.newDoctor.specialityId,
          licenseNumber: this.newDoctor.licenseNumber, biography: this.newDoctor.biography,
          yearsOfExperience: this.newDoctor.yearsOfExperience, isAvailable: true
        }).subscribe(() => {
          this.showForm = false;
          this.loadDoctors();
        });
      }
    });
  }

  deleteDoctor(id: number) {
    if (confirm('Delete this doctor?')) {
      this.http.delete(`${this.baseUrl}/Doctors/${id}`).subscribe(() => this.loadDoctors());
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

  logout() { this.authService.logout(); }
}