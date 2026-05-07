import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AdminAppointmentsComponent implements OnInit {
  appointments: any[] = [];
  doctors: any[] = [];
  patients: any[] = [];
  companies: any[] = [];
  showForm = false;
  editingAppointment: any = null;
  showNotifications = false;
  showProfileMenu = false;
  isDarkMode = false;
  adminName = 'Admin User';
  adminEmail = 'admin@medicalapp.com';
  private baseUrl = 'http://localhost:5039/api';

  newAppointment = {
    patientName: '', patientPhone: '', patientEmail: '', patientGender: '',
    symptoms: '', reason: '', dateTimeAppointment: '',
    idPatient: null, idDoctor: null, idCompany: null, isNewPatient: false
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
    this.loadAll();
  }

  loadAll() {
    this.http.get<any[]>(`${this.baseUrl}/Appointments`).subscribe(a => { this.appointments = a; this.cdr.detectChanges(); });
    this.http.get<any[]>(`${this.baseUrl}/Doctors`).subscribe(d => { this.doctors = d; });
    this.http.get<any[]>(`${this.baseUrl}/Patients`).subscribe(p => { this.patients = p; });
    this.http.get<any[]>(`${this.baseUrl}/InsuranceCompany`).subscribe(c => { this.companies = c; });
  }

  createAppointment() {
    this.http.post(`${this.baseUrl}/Appointments`, this.newAppointment).subscribe({
      next: () => { this.showForm = false; this.loadAll(); }
    });
  }

  editAppointment(app: any) {
    this.editingAppointment = { ...app };
  }

  updateAppointment() {
    this.http.put(`${this.baseUrl}/Appointments/${this.editingAppointment.idAppointment}`, this.editingAppointment).subscribe({
      next: () => { this.editingAppointment = null; this.loadAll(); }
    });
  }

  deleteAppointment(id: number) {
    if (confirm('Delete this appointment?')) {
      this.http.delete(`${this.baseUrl}/Appointments/${id}`).subscribe(() => this.loadAll());
    }
  }

  cancelEdit() { this.editingAppointment = null; }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.showProfileMenu = false;
    }
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) {
      this.showNotifications = false;
    }
  }

  logout() { this.authService.logout(); }
}