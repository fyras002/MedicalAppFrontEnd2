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
  filteredAppointments: any[] = [];
  displayedAppointments: any[] = [];
  showBookForm = false;
  doctors: any[] = [];
  showNotifications = false;
  showProfileMenu = false;
  isDarkMode = false;
  patientName = '';
  patientEmail = '';
  private baseUrl = 'http://localhost:5039/api';

  searchTerm = '';
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;

  newAppointment = { patientName: '', patientPhone: '', patientEmail: '', patientGender: '', symptoms: '', reason: '', dateTimeAppointment: '', idDoctor: null, idCompany: null };

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
              this.filteredAppointments = [...appointments];
              this.updatePagination();
              this.cdr.markForCheck();
            }
          });
        }
      }
    });
  }

  loadDoctors() {
    this.http.get<any[]>(`${this.baseUrl}/Doctors/available`).subscribe({
      next: (doctors) => { this.doctors = doctors; this.cdr.markForCheck(); }
    });
  }

  bookAppointment() {
    const user = this.authService.getUser();
    this.http.get<any[]>(`${this.baseUrl}/Patients`).subscribe({
      next: (patients) => {
        const me = patients.find((p: any) => p.userId === user.id);
        if (me) {
          this.http.post(`${this.baseUrl}/Appointments`, { ...this.newAppointment, idPatient: me.idPatient, isNewPatient: false }).subscribe({
            next: () => { 
              this.showBookForm = false; 
              this.loadMyAppointments(user.id); 
            }
          });
        }
      }
    });
  }

  cancelAppointment(id: number) {
    if (confirm('Cancel this appointment?')) {
      this.http.patch(`${this.baseUrl}/Appointments/${id}/status`, '"Cancelled"', {
        headers: { 'Content-Type': 'application/json' }
      }).subscribe({
        next: () => {
          const user = this.authService.getUser();
          this.loadMyAppointments(user.id);
        }
      });
    }
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredAppointments = [...this.appointments];
    } else {
      const normalizedTerm = term.replace(/, /g, ',').replace(/ /g, '').replace(/\./g, '');
      this.filteredAppointments = this.appointments.filter(a => {
        const dateStr = a.dateTimeAppointment 
          ? new Date(a.dateTimeAppointment).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            }).toLowerCase().replace(/, /g, ',').replace(/ /g, '')
          : '';
        return a.doctorFullName?.toLowerCase().replace(/ /g, '').replace(/\./g, '').includes(normalizedTerm) ||
          a.symptoms?.toLowerCase().replace(/ /g, '').includes(normalizedTerm) ||
          a.reason?.toLowerCase().replace(/ /g, '').includes(normalizedTerm) ||
          a.status?.toLowerCase().includes(normalizedTerm) ||
          dateStr.includes(normalizedTerm);
      });
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredAppointments.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    this.displayedAppointments = this.filteredAppointments.slice(start, start + this.pageSize);
    this.cdr.markForCheck();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  toggleDarkMode() { this.isDarkMode = !this.isDarkMode; this.cdr.markForCheck(); }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) { this.showProfileMenu = false; }
    this.cdr.markForCheck();
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) { this.showNotifications = false; }
    this.cdr.markForCheck();
  }

  logout() { this.authService.logout(); }
}