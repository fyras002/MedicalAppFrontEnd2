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
    this.http.get<any[]>(`${this.baseUrl}/Patients`).subscribe(p => { this.patients = p; });
  }

  createRecord() {
    this.http.post(`${this.baseUrl}/MedicalRecords`, this.newRecord).subscribe({
      next: () => { this.showForm = false; this.loadAll(); }
    });
  }

  editRecord(record: any) { this.editingRecord = { ...record }; }

  updateRecord() {
    this.http.put(`${this.baseUrl}/MedicalRecords/${this.editingRecord.idMedicalRecord}`, this.editingRecord).subscribe({
      next: () => { this.editingRecord = null; this.loadAll(); }
    });
  }

  deleteRecord(id: number) {
    if (confirm('Delete this medical record?')) {
      this.http.delete(`${this.baseUrl}/MedicalRecords/${id}`).subscribe(() => this.loadAll());
    }
  }

  cancelEdit() { this.editingRecord = null; }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) this.showProfileMenu = false;
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) this.showNotifications = false;
  }

  logout() { this.authService.logout(); }
}