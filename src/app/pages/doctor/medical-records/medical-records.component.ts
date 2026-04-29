import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'app-doctor-medical-records',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './medical-records.component.html',
  styleUrls: ['./medical-records.component.scss']
})
export class DoctorMedicalRecordsComponent implements OnInit {
  medicalRecords: any[] = [];
  selectedPatientId: number | null = null;
  showNotifications = false;
  showProfileMenu = false;
  doctorName = '';
  doctorEmail = '';
  speciality = '';
  private baseUrl = 'http://localhost:5039/api';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private doctorService: DoctorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.doctorName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Doctor';
    this.doctorEmail = user.email || '';
    this.loadDoctorInfo(user.id);
    
    this.route.params.subscribe(params => {
      this.selectedPatientId = params['patientId'] ? +params['patientId'] : null;
      this.loadMedicalRecords();
    });
  }

  loadDoctorInfo(userId: number) {
    this.doctorService.getDoctorByUserId(userId).subscribe({
      next: (doctors) => {
        const doctor = doctors[0];
        if (doctor) {
          this.speciality = doctor.specialityName;
        }
      }
    });
  }

  loadMedicalRecords() {
    if (this.selectedPatientId) {
      this.http.get<any>(`${this.baseUrl}/MedicalRecords/patient/${this.selectedPatientId}`).subscribe({
        next: (record) => {
          this.medicalRecords = record ? [record] : [];
          this.cdr.detectChanges();
        },
        error: () => {
          this.medicalRecords = [];
          this.cdr.detectChanges();
        }
      });
    } else {
      this.http.get<any[]>(`${this.baseUrl}/MedicalRecords`).subscribe({
        next: (records) => {
          this.medicalRecords = records || [];
          this.cdr.detectChanges();
        }
      });
    }
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