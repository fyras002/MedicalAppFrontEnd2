import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'app-medication-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './medication-list.component.html',
  styleUrls: ['./medication-list.component.scss']
})
export class MedicationListComponent implements OnInit {
  medications: any[] = [];
  editingMedication: any = null;
  showAddForm = false;
  showNotifications = false;
  showProfileMenu = false;
  isDarkMode = false;
  doctorName = '';
  doctorEmail = '';
  speciality = '';
  searchTerm = '';
  private doctorId: number | null = null;
  private baseUrl = 'http://localhost:5039/api';

  newMedication = {
    titleMedication: '', descriptionMedication: '', daysToTaken: '',
    ageRange: '', symptomesList: '', shouldnotbetaken: '',
    howToTake: '', dosage: '', sideEffects: ''
  };

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private doctorService: DoctorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.doctorName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Doctor';
    this.doctorEmail = user.email || '';
    this.loadDoctorAndMeds(user.id);
  }

  loadDoctorAndMeds(userId: number) {
    this.doctorService.getDoctorByUserId(userId).subscribe({
      next: (doctors) => {
        const doctor = doctors[0];
        if (doctor) { this.doctorId = doctor.id; this.speciality = doctor.specialityName; this.loadMedications(); }
      }
    });
  }

  loadMedications() {
    this.http.get<any[]>(`${this.baseUrl}/MedicationList`).subscribe({
      next: (meds) => { this.medications = meds || []; this.cdr.markForCheck(); }
    });
  }

  searchMedications() {
    if (!this.searchTerm.trim()) { this.loadMedications(); return; }
    this.http.get<any[]>(`${this.baseUrl}/MedicationList/search?q=${this.searchTerm}`).subscribe({
      next: (meds) => { this.medications = meds || []; this.cdr.markForCheck(); }
    });
  }

  createMedication() {
    this.http.post(`${this.baseUrl}/MedicationList`, this.newMedication).subscribe({
      next: () => {
        this.showAddForm = false;
        this.newMedication = { titleMedication: '', descriptionMedication: '', daysToTaken: '', ageRange: '', symptomesList: '', shouldnotbetaken: '', howToTake: '', dosage: '', sideEffects: '' };
        this.loadMedications();
        this.cdr.markForCheck();
      }
    });
  }

  editMedication(med: any) { this.editingMedication = { ...med }; this.showAddForm = false; }

  updateMedication() {
    this.http.put(`${this.baseUrl}/MedicationList/${this.editingMedication.idMedication}`, this.editingMedication).subscribe({
      next: () => { this.editingMedication = null; this.loadMedications(); this.cdr.markForCheck(); }
    });
  }

  deleteMedication(id: number) {
    if (confirm('Delete this medication?')) {
      this.http.delete(`${this.baseUrl}/MedicationList/${id}`).subscribe({
        next: () => { this.loadMedications(); this.cdr.markForCheck(); }
      });
    }
  }

  cancelEdit() { this.editingMedication = null; }
  toggleDarkMode() { this.isDarkMode = !this.isDarkMode; this.cdr.markForCheck(); }
  toggleNotifications() { this.showNotifications = !this.showNotifications; if (this.showNotifications) this.showProfileMenu = false; this.cdr.markForCheck(); }
  toggleProfileMenu() { this.showProfileMenu = !this.showProfileMenu; if (this.showProfileMenu) this.showNotifications = false; this.cdr.markForCheck(); }
  logout() { this.authService.logout(); }
}