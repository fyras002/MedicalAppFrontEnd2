import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-patient-medical-records',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './medical-records.component.html',
  styleUrls: ['./medical-records.component.scss']
})
export class PatientMedicalRecordsComponent implements OnInit {
  medicalRecord: any = null;
  showNotifications = false;
  showProfileMenu = false;
  isDarkMode = false;
  patientName = '';
  patientEmail = '';
  private baseUrl = 'http://localhost:5039/api';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.patientName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Patient';
    this.patientEmail = user.email || '';
    this.loadMyMedicalRecord(user.id);
  }

  loadMyMedicalRecord(userId: number) {
    this.http.get<any[]>(`${this.baseUrl}/Patients`).subscribe({
      next: (patients) => {
        const me = patients.find((p: any) => p.userId === userId);
        if (me) {
          this.http.get<any>(`${this.baseUrl}/MedicalRecords/patient/${me.idPatient}`).subscribe({
            next: (record) => {
              this.medicalRecord = record;
              this.cdr.markForCheck();
            },
            error: () => {
              this.medicalRecord = null;
              this.cdr.markForCheck();
            }
          });
        }
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