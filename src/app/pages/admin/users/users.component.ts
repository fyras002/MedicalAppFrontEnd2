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
  private baseUrl = 'http://localhost:5039/api';

  constructor(private authService: AuthService, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.http.get<any[]>(`${this.baseUrl}/Users`).subscribe({
      next: (users) => { this.users = users; this.cdr.detectChanges(); }
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
                alert('Cannot delete this user. They may be linked to a doctor or patient record. Delete those first.');
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

  logout() { this.authService.logout(); }
}