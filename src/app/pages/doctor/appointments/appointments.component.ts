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
  showNotifications = false;
  showProfileMenu = false;
  isDarkMode = false;
  doctorName = '';
  doctorEmail = '';
  speciality = '';

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
              this.cdr.markForCheck();
            }
          });
        }
      }
    });
  }

  updateStatus(appointment: any, status: string) {
    appointment.status = status;
    this.doctorService.updateAppointmentStatus(appointment.idAppointment, status).subscribe({
      next: () => {
        this.cdr.markForCheck();
      },
      error: () => {
        alert('Failed to update status');
        const user = this.authService.getUser();
        this.loadAppointments(user.id);
      }
    });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.cdr.markForCheck();
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.showProfileMenu = false;
    }
    this.cdr.markForCheck();
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) {
      this.showNotifications = false;
    }
    this.cdr.markForCheck();
  }

  logout() {
    this.authService.logout();
  }
}