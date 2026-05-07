import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'app-doctor-consultations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './consultations.component.html',
  styleUrls: ['./consultations.component.scss']
})
export class DoctorConsultationsComponent implements OnInit {
  consultations: any[] = [];
  patients: any[] = [];
  showForm = false;
  editingConsultation: any = null;
  showNotifications = false;
  showProfileMenu = false;
  isDarkMode = false;
  doctorName = '';
  doctorEmail = '';
  speciality = '';
  private baseUrl = 'http://localhost:5039/api';

  newConsultation = {
    idPatient: null,
    symptomsList: '',
    tests: '',
    medicationsList: '',
    notes: ''
  };

  constructor(
    private authService: AuthService,
    private doctorService: DoctorService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.doctorName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Doctor';
    this.doctorEmail = user.email || '';
    this.loadData(user.id);
  }

  loadData(userId: number) {
    this.doctorService.getDoctorByUserId(userId).subscribe({
      next: (doctors) => {
        const doctor = doctors[0];
        if (doctor) {
          this.speciality = doctor.specialityName;
          
          this.doctorService.getDoctorConsultations(doctor.id).subscribe({
            next: (consultations) => {
              this.consultations = consultations;
              this.cdr.markForCheck();
            }
          });
          
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

  createConsultation() {
    const user = this.authService.getUser();
    this.doctorService.getDoctorByUserId(user.id).subscribe({
      next: (doctors) => {
        const doctor = doctors[0];
        if (doctor) {
          this.doctorService.createConsultation({
            ...this.newConsultation,
            idDoctor: doctor.id,
            myDateTime: new Date().toISOString()
          }).subscribe({
            next: () => {
              this.showForm = false;
              this.loadData(user.id);
              this.cdr.markForCheck();
            }
          });
        }
      }
    });
  }

  editConsultation(consultation: any) {
    this.editingConsultation = { ...consultation };
  }

  updateConsultation() {
    this.http.put(`${this.baseUrl}/Consultations/${this.editingConsultation.idConsultation}`, this.editingConsultation).subscribe({
      next: () => {
        this.editingConsultation = null;
        const user = this.authService.getUser();
        this.loadData(user.id);
        this.cdr.markForCheck();
      }
    });
  }

  deleteConsultation(id: number) {
    if (confirm('Delete this consultation?')) {
      this.http.delete(`${this.baseUrl}/Consultations/${id}`).subscribe({
        next: () => {
          const user = this.authService.getUser();
          this.loadData(user.id);
          this.cdr.markForCheck();
        }
      });
    }
  }

  cancelEdit() {
    this.editingConsultation = null;
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