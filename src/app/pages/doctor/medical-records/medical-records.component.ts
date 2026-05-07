import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'app-doctor-medical-records',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './medical-records.component.html',
  styleUrls: ['./medical-records.component.scss']
})
export class DoctorMedicalRecordsComponent implements OnInit {
  medicalRecords: any[] = [];
  selectedPatientId: number | null = null;
  editingRecord: any = null;
  showAddForm = false;
  showDocForm = false;
  showNotifications = false;
  showProfileMenu = false;
  isDarkMode = false;
  doctorName = '';
  doctorEmail = '';
  speciality = '';
  selectedFile: File | null = null;
  private doctorId: number | null = null;
  private baseUrl = 'http://localhost:5039/api';

  newRecord = {
    bloodDraw: '', height: '', weight: '',
    medicalCheckup: '', hereditaryDiseases: '', chronicDiseases: '', status: 'Active'
  };

  newDocument = {
    titleDocument: '', descriptionDocument: '',
    dateDocument: new Date().toISOString(), idMedicalRecord: null as number | null
  };

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
    this.route.params.subscribe(params => { this.selectedPatientId = params['patientId'] ? +params['patientId'] : null; });
    this.loadDoctorAndRecords(user.id);
  }

  loadDoctorAndRecords(userId: number) {
    this.doctorService.getDoctorByUserId(userId).subscribe({
      next: (doctors) => {
        const doctor = doctors[0];
        if (doctor) { this.doctorId = doctor.id; this.speciality = doctor.specialityName; this.loadMedicalRecords(); }
      }
    });
  }

  loadMedicalRecords() {
    if (!this.doctorId) return;
    if (this.selectedPatientId) {
      this.http.get<any>(`${this.baseUrl}/MedicalRecords/patient/${this.selectedPatientId}`).subscribe({
        next: (record) => { this.medicalRecords = record ? [record] : []; this.cdr.markForCheck(); },
        error: () => { this.medicalRecords = []; this.cdr.markForCheck(); }
      });
    } else {
      this.doctorService.getDoctorMedicalRecords(this.doctorId).subscribe({
        next: (records) => { this.medicalRecords = records || []; this.cdr.markForCheck(); }
      });
    }
  }

  createRecord() {
    this.http.post(`${this.baseUrl}/MedicalRecords`, this.newRecord).subscribe({
      next: () => {
        this.showAddForm = false;
        this.newRecord = { bloodDraw: '', height: '', weight: '', medicalCheckup: '', hereditaryDiseases: '', chronicDiseases: '', status: 'Active' };
        this.loadMedicalRecords();
        this.cdr.markForCheck();
      }
    });
  }

  addDocument(record: any) { this.newDocument.idMedicalRecord = record.idMedicalRecord; this.showDocForm = true; this.selectedFile = null; }
  onFileSelected(event: any) { this.selectedFile = event.target.files[0]; }

  uploadDocument() {
    if (!this.selectedFile) { alert('Please select a file'); return; }
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('titleDocument', this.newDocument.titleDocument);
    formData.append('descriptionDocument', this.newDocument.descriptionDocument || '');
    if (this.newDocument.idMedicalRecord) { formData.append('idMedicalRecord', this.newDocument.idMedicalRecord.toString()); }
    this.http.post(`${this.baseUrl}/Documents/upload`, formData).subscribe({
      next: () => {
        this.showDocForm = false; this.selectedFile = null;
        this.newDocument = { titleDocument: '', descriptionDocument: '', dateDocument: new Date().toISOString(), idMedicalRecord: null };
        this.cdr.markForCheck(); this.loadMedicalRecords();
      },
      error: () => { alert('Upload failed'); }
    });
  }

  deleteDocument(docId: number, record: any) {
    if (confirm('Delete this document?')) { this.http.delete(`${this.baseUrl}/Documents/${docId}`).subscribe({ next: () => { this.loadMedicalRecords(); this.cdr.markForCheck(); } }); }
  }

  editRecord(record: any) { this.editingRecord = { ...record }; }

  updateRecord() {
    this.http.put(`${this.baseUrl}/MedicalRecords/${this.editingRecord.idMedicalRecord}`, this.editingRecord).subscribe({
      next: () => { this.editingRecord = null; this.loadMedicalRecords(); this.cdr.markForCheck(); }
    });
  }

  deleteRecord(id: number) {
    if (confirm('Delete this medical record?')) { this.http.delete(`${this.baseUrl}/MedicalRecords/${id}`).subscribe({ next: () => { this.loadMedicalRecords(); this.cdr.markForCheck(); } }); }
  }

  cancelEdit() { this.editingRecord = null; }

  toggleDarkMode() { this.isDarkMode = !this.isDarkMode; this.cdr.markForCheck(); }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) { this.showProfileMenu = false; }
    this.cdr.markForCheck();
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) { this.showNotifications = false; }
    this.cdr.markForCheck();
  }

  logout() { this.authService.logout(); }
}