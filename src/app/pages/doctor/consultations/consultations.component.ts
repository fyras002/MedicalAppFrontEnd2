import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
  showNotifications = false;
  showProfileMenu = false;
  doctorName = '';
  doctorEmail = '';
  speciality = '';

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
              this.cdr.detectChanges();
            }
          });
        }
      }
    });
    this.doctorService.getAllPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.cdr.detectChanges();
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