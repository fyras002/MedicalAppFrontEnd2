import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class PatientDashboardComponent implements OnInit {
  username = '';
  myAppointments: any[] = [];
  private baseUrl = 'http://localhost:5039/api';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.username = user.firstname || 'Patient';
    this.loadMyAppointments(user.id);
  }

  loadMyAppointments(userId: number) {
    this.http.get<any[]>(`${this.baseUrl}/Patients`).subscribe({
      next: (patients) => {
        const me = patients.find((p: any) => p.userId === userId);
        if (me) {
          this.http.get<any[]>(`${this.baseUrl}/Appointments/patient/${me.idPatient}`).subscribe({
            next: (appointments) => {
              this.myAppointments = appointments;
              this.cdr.detectChanges();
            }
          });
        }
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}