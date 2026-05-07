import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-specialities',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './specialities.component.html',
  styleUrls: ['./specialities.component.scss']
})
export class AdminSpecialitiesComponent implements OnInit {
  specialities: any[] = [];
  editingSpeciality: any = null;
  showNotifications = false;
  showProfileMenu = false;
  isDarkMode = false;
  adminName = 'Admin User';
  adminEmail = 'admin@medicalapp.com';
  private baseUrl = 'http://localhost:5039/api';

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
    this.loadSpecialities();
  }

  loadSpecialities() {
    this.http.get<any[]>(`${this.baseUrl}/Specialities`).subscribe({
      next: (data) => {
        this.specialities = data;
        this.cdr.detectChanges();
      }
    });
  }

  editSpeciality(speciality: any) {
    this.editingSpeciality = { ...speciality };
  }

  updateSpeciality() {
    const dto = {
      description: this.editingSpeciality.description
    };
    this.http.put(`${this.baseUrl}/Specialities/${this.editingSpeciality.id}`, dto).subscribe({
      next: () => {
        this.editingSpeciality = null;
        this.cdr.detectChanges();
        this.loadSpecialities();
      }
    });
  }

  cancelEdit() {
    this.editingSpeciality = null;
  }

  deleteSpeciality(id: number) {
    if (confirm('Delete this speciality?')) {
      this.http.delete(`${this.baseUrl}/Specialities/${id}`).subscribe({
        next: () => this.loadSpecialities(),
        error: () => alert('Cannot delete. It may have doctors linked.')
      });
    }
  }

  getSpecialityName(value: any): string {
    const names: { [key: number]: string } = {
      1: 'Cardiology', 2: 'Dermatology', 3: 'Neurology',
      4: 'Pediatrics', 5: 'Radiology', 6: 'General Medicine',
      7: 'Orthopedics', 8: 'Psychiatry', 9: 'Ophthalmology',
      10: 'Gynecology', 11: 'Urology', 12: 'ENT',
      13: 'Gastroenterology', 14: 'Pulmonology', 15: 'Nephrology',
      16: 'Endocrinology', 17: 'Rheumatology', 18: 'Hematology',
      19: 'Oncology', 20: 'Anesthesiology', 21: 'Emergency Medicine',
      22: 'Pathology', 23: 'Plastic Surgery', 24: 'Vascular Surgery',
      25: 'Neurosurgery'
    };
    if (typeof value === 'number') return names[value] || String(value);
    return value || '';
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
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