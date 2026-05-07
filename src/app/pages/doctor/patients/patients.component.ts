import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'app-doctor-patients',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss']
})
export class DoctorPatientsComponent implements OnInit {
  patients: any[] = [];
  showNotifications = false;
  showProfileMenu = false;
  isDarkMode = false;
  doctorName = '';
  doctorEmail = '';
  speciality = '';

  constructor(
    private authService: AuthService,
    private doctorService: DoctorService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.doctorName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Doctor';
    this.doctorEmail = user.email || '';
    this.loadMyData(user.id);
  }

  loadMyData(userId: number) {
    this.doctorService.getDoctorByUserId(userId).subscribe({
      next: (doctors) => {
        const doctor = doctors[0];
        if (doctor) {
          this.speciality = doctor.specialityName;
          this.doctorService.getDoctorPatients(doctor.id).subscribe({
            next: (patients) => {
              this.patients = patients;
              this.cdr.markForCheck();
            }
          });
        }
      }
    });
  }

  viewMedicalRecord(patient: any) {
    this.router.navigate(['/doctor/medical-records', patient.idPatient]);
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