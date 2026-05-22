import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class DoctorAppointmentsComponent implements OnInit {
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  displayedAppointments: any[] = [];
  showNotifications = false;
  showProfileMenu = false;
  isDarkMode = false;
  doctorName = '';
  doctorEmail = '';
  speciality = '';
  searchTerm = '';
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;

  constructor(
    private authService: AuthService,
    private doctorService: DoctorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.doctorName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Doctor';
    this.doctorEmail = user.email || '';
    this.loadAppointments(user.id);
  }

  loadAppointments(userId: number) {
    this.doctorService.getDoctorByUserId(userId).subscribe({
      next: (doctors) => {
        const doctor = doctors[0];
        if (doctor) {
          this.speciality = doctor.specialityName;
          this.doctorService.getDoctorAppointments(doctor.id).subscribe({
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
        return a.patientName?.toLowerCase().replace(/ /g, '').includes(normalizedTerm) ||
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
    if (this.currentPage < this.totalPages) { this.currentPage++; this.updatePagination(); }
  }

  prevPage() {
    if (this.currentPage > 1) { this.currentPage--; this.updatePagination(); }
  }

  updateStatus(appointment: any, status: string) {
    appointment.status = status;
    this.doctorService.updateAppointmentStatus(appointment.idAppointment, status).subscribe({
      next: () => { this.cdr.markForCheck(); },
      error: () => { alert('Failed to update status'); const user = this.authService.getUser(); this.loadAppointments(user.id); }
    });
  }

  toggleDarkMode() { this.isDarkMode = !this.isDarkMode; this.cdr.markForCheck(); }
  toggleNotifications() { this.showNotifications = !this.showNotifications; if (this.showNotifications) this.showProfileMenu = false; this.cdr.markForCheck(); }
  toggleProfileMenu() { this.showProfileMenu = !this.showProfileMenu; if (this.showProfileMenu) this.showNotifications = false; this.cdr.markForCheck(); }
  logout() { this.authService.logout(); }
}