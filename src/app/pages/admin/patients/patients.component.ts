import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss']
})
export class AdminPatientsComponent implements OnInit {
  patients: any[] = [];
  showForm = false;
  editingPatient: any = null;
  private baseUrl = 'http://localhost:5039/api';

  newPatient = {
    firstname: '', lastname: '', email: '', phone: '',
    birthdate: '', cin: '', address: '', active: true
  };

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.http.get<any[]>(`${this.baseUrl}/Patients`).subscribe({
      next: (patients) => {
        this.patients = patients;
        this.cdr.detectChanges();
      }
    });
  }

  createPatient() {
    this.http.post(`${this.baseUrl}/Patients`, this.newPatient).subscribe({
      next: () => {
        this.showForm = false;
        this.newPatient = { firstname: '', lastname: '', email: '', phone: '', birthdate: '', cin: '', address: '', active: true };
        this.loadPatients();
      }
    });
  }

  editPatient(patient: any) {
    this.editingPatient = { ...patient };
  }

  updatePatient() {
    this.http.put(`${this.baseUrl}/Patients/${this.editingPatient.idPatient}`, this.editingPatient).subscribe({
      next: () => {
        this.editingPatient = null;
        this.loadPatients();
      }
    });
  }

  deletePatient(id: number) {
    if (confirm('Delete this patient?')) {
      this.http.delete(`${this.baseUrl}/Patients/${id}`).subscribe({
        next: () => this.loadPatients(),
        error: () => alert('Cannot delete patient. They may have appointments or medical records.')
      });
    }
  }

  cancelEdit() {
    this.editingPatient = null;
  }

  logout() {
    this.authService.logout();
  }
}