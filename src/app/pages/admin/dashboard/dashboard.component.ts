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
  
  recentActivities: any[] = [];
  
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
    this.http.get<any[]>(`${this.baseUrl}/Users`).subscribe(u => { 
      this.totalUsers = u.length; 
      this.cdr.detectChanges(); 
    });
    
    this.http.get<any[]>(`${this.baseUrl}/Doctors`).subscribe(d => { 
      this.totalDoctors = d.length; 
      this.cdr.detectChanges(); 
    });
    
    this.http.get<any[]>(`${this.baseUrl}/Patients`).subscribe(p => { 
      this.totalPatients = p.length; 
      this.cdr.detectChanges(); 
    });
    
    this.http.get<any[]>(`${this.baseUrl}/Appointments`).subscribe(a => { 
      this.totalAppointments = a.length; 
      this.cdr.detectChanges(); 
    });
    
    this.loadRecentActivities();
  }

  loadRecentActivities() {
    const activities: any[] = [];
    
    this.http.get<any[]>(`${this.baseUrl}/Patients`).subscribe(patients => {
      patients.slice(0, 3).forEach(p => {
        activities.push({
          icon: 'fa-user-plus',
          text: `${p.firstname} ${p.lastname} registered as patient`,
          time: this.getTimeAgo(new Date())
        });
      });
      
      this.http.get<any[]>(`${this.baseUrl}/Doctors`).subscribe(doctors => {
        doctors.slice(0, 2).forEach(d => {
          activities.push({
            icon: 'fa-user-md',
            text: `Dr. ${d.fullName} joined as ${d.specialityName}`,
            time: this.getTimeAgo(new Date())
          });
        });
        
        this.http.get<any[]>(`${this.baseUrl}/Appointments`).subscribe(appointments => {
          const sorted = appointments
            .filter(a => a.dateTimeAppointment)
            .sort((a, b) => new Date(b.dateTimeAppointment).getTime() - new Date(a.dateTimeAppointment).getTime());
          
          sorted.slice(0, 3).forEach(a => {
            activities.push({
              icon: 'fa-calendar-check',
              text: `Appointment: ${a.patientName || 'Unknown'} → Dr. ${a.doctorFullName || 'N/A'}`,
              time: this.getTimeAgo(new Date(a.dateTimeAppointment))
            });
          });
          
          this.http.get<any[]>(`${this.baseUrl}/Consultations`).subscribe(consultations => {
            const sortedCons = consultations
              .filter(c => c.myDateTime)
              .sort((a, b) => new Date(b.myDateTime).getTime() - new Date(a.myDateTime).getTime());
            
            sortedCons.slice(0, 2).forEach(c => {
              activities.push({
                icon: 'fa-notes-medical',
                text: `Consultation: ${c.patientFullName || 'Patient'} with Dr. ${c.doctorFullName || 'N/A'}`,
                time: this.getTimeAgo(new Date(c.myDateTime))
              });
            });
            
            activities.sort((a, b) => b.timeValue - a.timeValue);
            this.recentActivities = activities.slice(0, 6);
            this.cdr.detectChanges();
          });
        });
      });
    });
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  }

  logout() { this.authService.logout(); }
}