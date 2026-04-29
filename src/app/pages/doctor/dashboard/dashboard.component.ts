import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit {
  username = '';
  speciality = '';
  yearsOfExperience = 0;
  todayAppointments: any[] = [];
  totalPatients = 0;
  pendingConsultations = 0;
  showNotifications = false;
  showProfileMenu = false;
  doctorName = '';
  doctorEmail = '';

  constructor(
    private authService: AuthService,
    private doctorService: DoctorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.username = user.lastname || 'Doctor';
    this.doctorName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Doctor';
    this.doctorEmail = user.email || '';
    this.loadDoctorData(user.id);
  }

  loadDoctorData(userId: number) {
    this.doctorService.getDoctorByUserId(userId).subscribe({
      next: (doctors) => {
        const doctor = doctors[0];
        if (doctor) {
          this.speciality = doctor.specialityName;
          this.yearsOfExperience = doctor.yearsOfExperience || 0;
          this.loadAppointments(doctor.id);
          this.loadConsultations(doctor.id);
          this.loadPatients(doctor.id);
          this.cdr.detectChanges();
        }
      }
    });
  }

  loadAppointments(doctorId: number) {
    this.doctorService.getDoctorAppointments(doctorId).subscribe({
      next: (appointments) => {
        this.todayAppointments = appointments.filter((a: any) => {
          const today = new Date().toDateString();
          const appDate = new Date(a.dateTimeAppointment).toDateString();
          return today === appDate;
        });
        this.cdr.detectChanges();
      }
    });
  }

  loadConsultations(doctorId: number) {
    this.doctorService.getDoctorConsultations(doctorId).subscribe({
      next: (consultations) => {
        this.pendingConsultations = consultations.length;
        this.cdr.detectChanges();
      }
    });
  }

  loadPatients(doctorId: number) {
    this.doctorService.getDoctorPatients(doctorId).subscribe({
      next: (patients) => {
        this.totalPatients = patients.length;
        this.cdr.detectChanges();
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