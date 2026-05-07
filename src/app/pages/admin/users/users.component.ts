import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  showNotifications = false;
  showProfileMenu = false;
  isDarkMode = false;
  adminName = 'Admin User';
  adminEmail = 'admin@medicalapp.com';
  notificationCount = 0;
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
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<any[]>(`${this.baseUrl}/Users`).subscribe({
      next: (users) => {
        this.users = users;
        this.notificationCount = users.length;
        this.cdr.detectChanges();
      }
    });
  }

  deleteUser(id: number) {
    if (confirm('Delete this user?')) {
      this.http.delete(`${this.baseUrl}/Users/${id}`).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          console.error('Delete failed:', err);
          alert('Cannot delete this user. They may be linked to a doctor or patient record.');
        }
      });
    }
  }

  getRoleName(role: number): string {
    if (role === 1) return 'Admin';
    if (role === 2) return 'Doctor';
    if (role === 3) return 'Patient';
    return 'Unknown';
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
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