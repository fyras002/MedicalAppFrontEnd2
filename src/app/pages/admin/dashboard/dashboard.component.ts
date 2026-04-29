import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  totalUsers = 0;
  totalDoctors = 0;
  totalPatients = 0;
  totalAppointments = 0;
  private baseUrl = 'http://localhost:5039/api';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.http.get<any[]>(`${this.baseUrl}/Users`).subscribe(u => { this.totalUsers = u.length; this.cdr.detectChanges(); });
    this.http.get<any[]>(`${this.baseUrl}/Doctors`).subscribe(d => { this.totalDoctors = d.length; this.cdr.detectChanges(); });
    this.http.get<any[]>(`${this.baseUrl}/Patients`).subscribe(p => { this.totalPatients = p.length; this.cdr.detectChanges(); });
    this.http.get<any[]>(`${this.baseUrl}/Appointments`).subscribe(a => { this.totalAppointments = a.length; this.cdr.detectChanges(); });
  }

  logout() { this.authService.logout(); }
}