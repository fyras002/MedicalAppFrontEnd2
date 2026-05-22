import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-patient-medical-records',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './medical-records.component.html',
  styleUrls: ['./medical-records.component.scss']
})
export class PatientMedicalRecordsComponent implements OnInit {
  medicalRecord: any = null;
  isEditing = false;
  isCreating = false;
  editedRecord: any = {};
  showNotifications = false;
  showProfileMenu = false;
  isDarkMode = false;
  patientName = '';
  patientEmail = '';
  patientId: number = 0;
  isLoading = false;
  errorMessage: string = '';
  successMessage: string = '';
  
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
    this.isLoading = true;
    this.http.get<any[]>(`${this.baseUrl}/Patients`).subscribe({
      next: (patients) => {
        const me = patients.find((p: any) => p.userId === userId);
        if (me) {
          this.patientId = me.idPatient;
          this.http.get<any>(`${this.baseUrl}/MedicalRecords/patient/${me.idPatient}`).subscribe({
            next: (record) => {
              this.medicalRecord = record;
              this.isLoading = false;
              this.cdr.markForCheck();
            },
            error: () => {
              this.medicalRecord = null;
              this.isLoading = false;
              this.cdr.markForCheck();
            }
          });
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // Start editing existing record
  startEdit() {
    this.isEditing = true;
    this.editedRecord = {
      chronicDiseases: this.medicalRecord?.chronicDiseases || '',
      hereditaryDiseases: this.medicalRecord?.hereditaryDiseases || '',
      height: this.medicalRecord?.height || '',
      weight: this.medicalRecord?.weight || '',
      bloodDraw: this.medicalRecord?.bloodDraw || '',
      medications: this.medicalRecord?.medications || '',
      allergies: this.medicalRecord?.allergies || '',
      surgeries: this.medicalRecord?.surgeries || ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Cancel editing
  cancelEdit() {
    this.isEditing = false;
    this.editedRecord = {};
    this.errorMessage = '';
  }

  // Update medical record
  updateRecord() {
    if (!this.medicalRecord?.idMedicalRecord) {
      this.errorMessage = 'No medical record found to update.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.put(`${this.baseUrl}/MedicalRecords/${this.medicalRecord.idMedicalRecord}`, this.editedRecord)
      .subscribe({
        next: (response: any) => {
          // Update local record with new data
          this.medicalRecord = {
            ...this.medicalRecord,
            ...this.editedRecord
          };
          this.isEditing = false;
          this.isLoading = false;
          this.successMessage = 'Medical record updated successfully!';
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.markForCheck();
          }, 3000);
          
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error updating medical record:', err);
          this.errorMessage = err.error?.message || 'Failed to update medical record. Please try again.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  // Start creating new record
  startCreate() {
    this.isCreating = true;
    this.editedRecord = {
      chronicDiseases: '',
      hereditaryDiseases: '',
      height: '',
      weight: '',
      bloodDraw: '',
      medications: '',
      allergies: '',
      surgeries: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Cancel creating
  cancelCreate() {
    this.isCreating = false;
    this.editedRecord = {};
    this.errorMessage = '';
  }

  // Create new medical record
  createRecord() {
    if (!this.patientId) {
      this.errorMessage = 'Patient ID not found.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const newRecord = {
      idPatient: this.patientId,
      ...this.editedRecord
    };

    this.http.post(`${this.baseUrl}/MedicalRecords`, newRecord)
      .subscribe({
        next: (response: any) => {
          this.medicalRecord = response;
          this.isCreating = false;
          this.isLoading = false;
          this.successMessage = 'Medical record created successfully!';
          
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.markForCheck();
          }, 3000);
          
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error creating medical record:', err);
          this.errorMessage = err.error?.message || 'Failed to create medical record. Please try again.';
          this.isLoading = false;
          this.cdr.markForCheck();
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