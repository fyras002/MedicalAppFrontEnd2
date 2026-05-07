import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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
  isDarkMode = false;
  doctorName = '';
  doctorEmail = '';
  profilePhoto = '';
  userId = 0;

  // Modal
  showProfileModal = false;
  editFirstname = '';
  editLastname = '';
  editEmail = '';
  photoPreview: string | null = null;
  selectedPhotoFile: File | null = null;
  saving = false;
  saveSuccess = false;
  saveError = '';

  private apiUrl = 'http://localhost:5039/api';

  constructor(
    private authService: AuthService,
    private doctorService: DoctorService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = user.id;
    this.username = user.lastname || 'Doctor';
    this.doctorName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Doctor';
    this.doctorEmail = user.email || '';
    this.profilePhoto = user.photo || '';
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
          this.cdr.markForCheck();
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
        this.cdr.markForCheck();
      }
    });
  }

  loadConsultations(doctorId: number) {
    this.doctorService.getDoctorConsultations(doctorId).subscribe({
      next: (consultations) => {
        this.pendingConsultations = consultations.length;
        this.cdr.markForCheck();
      }
    });
  }

  loadPatients(doctorId: number) {
    this.doctorService.getDoctorPatients(doctorId).subscribe({
      next: (patients) => {
        this.totalPatients = patients.length;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Profile Modal ──────────────────────────────────────
  openProfileModal() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.editFirstname = user.firstname || '';
    this.editLastname = user.lastname || '';
    this.editEmail = user.email || '';
    this.photoPreview = null;
    this.selectedPhotoFile = null;
    this.saveSuccess = false;
    this.saveError = '';
    this.showProfileModal = true;
    this.showProfileMenu = false;
    this.cdr.markForCheck();
  }

  closeProfileModal() {
    this.showProfileModal = false;
    this.cdr.markForCheck();
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedPhotoFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.photoPreview = e.target.result;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  saveProfile() {
    this.saving = true;
    this.saveSuccess = false;
    this.saveError = '';

    // Step 1 — update name and email
    const updateDto = {
      firstname: this.editFirstname,
      lastname: this.editLastname,
      email: this.editEmail
    };

    this.http.put<any>(`${this.apiUrl}/Users/${this.userId}`, updateDto).subscribe({
      next: (updatedUser) => {
        // Step 2 — upload photo if selected
        if (this.selectedPhotoFile) {
          const formData = new FormData();
          formData.append('file', this.selectedPhotoFile);
          this.http.post<any>(`${this.apiUrl}/Users/${this.userId}/upload-photo`, formData).subscribe({
            next: (res) => {
              this.updateLocalStorage(res);
              this.saving = false;
              this.saveSuccess = true;
              this.cdr.markForCheck();
            },
            error: () => {
              // photo failed but info saved
              this.updateLocalStorage(updatedUser);
              this.saving = false;
              this.saveSuccess = true;
              this.cdr.markForCheck();
            }
          });
        } else {
          this.updateLocalStorage(updatedUser);
          this.saving = false;
          this.saveSuccess = true;
          this.cdr.markForCheck();
        }
      },
      error: () => {
        this.saving = false;
        this.saveError = 'Failed to update profile. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  updateLocalStorage(user: any) {
    const current = JSON.parse(localStorage.getItem('user') || '{}');
    const updated = { ...current, ...user };
    localStorage.setItem('user', JSON.stringify(updated));
    this.doctorName = `${user.firstname || ''} ${user.lastname || ''}`.trim();
    this.username = user.lastname || '';
    this.doctorEmail = user.email || '';
    this.profilePhoto = user.photo || this.profilePhoto;
    this.cdr.markForCheck();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.cdr.markForCheck();
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) this.showProfileMenu = false;
    this.cdr.markForCheck();
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) this.showNotifications = false;
    this.cdr.markForCheck();
  }

  logout() {
    this.authService.logout();
  }
}