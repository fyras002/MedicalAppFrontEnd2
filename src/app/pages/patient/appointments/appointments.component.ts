import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class PatientAppointmentsComponent implements OnInit {
  appointments: any[] = [];
  showBookForm = false;
  doctors: any[] = [];
  showNotifications = false;
  showProfileMenu = false;
  patientName = '';
  patientEmail = '';
  private baseUrl = 'http://localhost:5039/api';

  newAppointment = {
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    patientGender: '',
    symptoms: '',
    reason: '',
    dateTimeAppointment: '',
    idDoctor: null,
    idCompany: null
  };

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.patientName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Patient';
    this.patientEmail = user.email || '';
    this.loadMyAppointments(user.id);
  }

  loadMyAppointments(userId: number) {
    this.http.get<any[]>(`${this.baseUrl}/Patients`).subscribe({
      next: (patients) => {
        const me = patients.find((p: any) => p.userId === userId);
        if (me) {
          this.newAppointment.patientName = `${me.firstname} ${me.lastname}`;
          this.newAppointment.patientPhone = me.phone;
          this.newAppointment.patientEmail = me.email;
          
          this.http.get<any[]>(`${this.baseUrl}/Appointments/patient/${me.idPatient}`).subscribe({
            next: (appointments) => {
              this.appointments = appointments;
              this.cdr.detectChanges();
            }
          });
        }
      }
    });
  }

  loadDoctors() {
    this.http.get<any[]>(`${this.baseUrl}/Doctors/available`).subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.cdr.detectChanges();
      }
    });
  }

  bookAppointment() {
    const user = this.authService.getUser();
    this.http.get<any[]>(`${this.baseUrl}/Patients`).subscribe({
      next: (patients) => {
        const me = patients.find((p: any) => p.userId === user.id);
        if (me) {
          this.http.post(`${this.baseUrl}/Appointments`, {
            ...this.newAppointment,
            idPatient: me.idPatient,
            isNewPatient: false
          }).subscribe({
            next: () => {
              this.showBookForm = false;
              this.loadMyAppointments(user.id);
              this.cdr.detectChanges();
            }
          });
        }
      }
    });
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