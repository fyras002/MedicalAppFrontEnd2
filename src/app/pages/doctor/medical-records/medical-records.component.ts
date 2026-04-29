import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

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
  private baseUrl = 'http://localhost:5039/api';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.selectedPatientId = params['patientId'] ? +params['patientId'] : null;
      this.loadMedicalRecords();
    });
  }

  loadMedicalRecords() {
    if (this.selectedPatientId) {
      this.http.get<any>(`${this.baseUrl}/MedicalRecords/patient/${this.selectedPatientId}`).subscribe({
        next: (record) => {
          if (record) {
            this.medicalRecords = [record];
          } else {
            this.medicalRecords = [];
          }
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

  logout() {
    this.authService.logout();
  }
}