import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-medical-records',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './medical-records.component.html',
  styleUrls: ['./medical-records.component.scss']
})
export class AdminMedicalRecordsComponent implements OnInit {
  medicalRecords: any[] = [];
  patients: any[] = [];
  showForm = false;
  editingRecord: any = null;
  showNotifications = false;
  showProfileMenu = false;
  isDarkMode = false;
  adminName = 'Admin User';
  adminEmail = 'admin@medicalapp.com';
  private baseUrl = 'http://localhost:5039/api';

  newRecord = { idPatient: null, bloodDraw: '', height: '', weight: '', medicalCheckup: '', hereditaryDiseases: '', chronicDiseases: '', status: 'Active' };

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    if (user.firstname) {
      this.adminName = `${user.firstname} ${user.lastname}`;
      this.adminEmail = user.email || 'admin@medicalapp.com';
    }
    this.loadAll();
  }

  loadAll() {
    this.http.get<any[]>(`${this.baseUrl}/MedicalRecords`).subscribe(r => { this.medicalRecords = r; this.cdr.detectChanges(); });
    this.http.get<any[]>(`${this.baseUrl}/Patients`).subscribe(p => { this.patients = p; this.cdr.detectChanges(); });
  }

  createRecord() {
    this.http.post(`${this.baseUrl}/MedicalRecords`, this.newRecord).subscribe({
      next: () => { this.showForm = false; this.loadAll(); this.cdr.detectChanges(); }
    });
  }

  editRecord(record: any) { 
    this.editingRecord = { ...record }; 
    this.cdr.detectChanges();
  }

  updateRecord() {
    this.http.put(`${this.baseUrl}/MedicalRecords/${this.editingRecord.idMedicalRecord}`, this.editingRecord).subscribe({
      next: () => { this.editingRecord = null; this.loadAll(); this.cdr.detectChanges(); }
    });
  }

  deleteRecord(id: number) {
    if (confirm('Delete this medical record?')) {
      this.http.delete(`${this.baseUrl}/MedicalRecords/${id}`).subscribe(() => { this.loadAll(); this.cdr.detectChanges(); });
    }
  }

  cancelEdit() { 
    this.editingRecord = null; 
    this.cdr.detectChanges();
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

  logout() { this.authService.logout(); }
}