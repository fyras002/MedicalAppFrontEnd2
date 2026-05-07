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
  showNotifications = false;
  showProfileMenu = false;
  isDarkMode = false;
  adminName = 'Admin User';
  adminEmail = 'admin@medicalapp.com';
  private baseUrl = 'http://localhost:5039/api';

  newPatient = {
    username: '',
    password: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    birthdate: '',
    cin: '',
    address: '',
    active: true
  };

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
    this.loadPatients();
  }

  loadPatients() {
    this.http.get<any[]>(`${this.baseUrl}/Patients`).subscribe({
      next: (patients) => {
        this.patients = patients;
        this.cdr.markForCheck();
      }
    });
  }

  createPatient() {
    const userData = {
      username: this.newPatient.username || this.newPatient.email,
      email: this.newPatient.email,
      password: this.newPatient.password || 'Patient123',
      firstname: this.newPatient.firstname,
      lastname: this.newPatient.lastname,
      role: 3
    };

    this.http.post(`${this.baseUrl}/Users`, userData).subscribe({
      next: (user: any) => {
        const patientData = {
          userId: user.id,
          firstname: this.newPatient.firstname,
          lastname: this.newPatient.lastname,
          email: this.newPatient.email,
          phone: this.newPatient.phone,
          birthdate: this.newPatient.birthdate,
          cin: this.newPatient.cin,
          address: this.newPatient.address,
          active: this.newPatient.active
        };

        this.http.post(`${this.baseUrl}/Patients`, patientData).subscribe({
          next: () => {
            this.showForm = false;
            this.newPatient = {
              username: '', password: '', firstname: '', lastname: '',
              email: '', phone: '', birthdate: '', cin: '', address: '', active: true
            };
            this.loadPatients();
          }
        });
      },
      error: () => alert('Failed to create user account')
    });
  }

  editPatient(patient: any) {
    this.editingPatient = { ...patient };
  }

  updatePatient() {
    if (!this.editingPatient || !this.editingPatient.idPatient) {
      alert('No patient selected');
      return;
    }

    console.log('Sending payload:', this.editingPatient);

    this.http.put(`${this.baseUrl}/Patients/${this.editingPatient.idPatient}`, this.editingPatient).subscribe({
      next: (response) => {
        console.log('Update success:', response);
        this.editingPatient = null;
        this.loadPatients();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Full error:', err);
        alert('Failed to update patient. Check console for details.');
      }
    });
  }

  deletePatient(id: number) {
    if (confirm('Delete this patient?')) {
      this.http.delete(`${this.baseUrl}/Patients/${id}`).subscribe({
        next: () => {
          this.loadPatients();
        },
        error: () => alert('Cannot delete patient. They may have appointments or medical records.')
      });
    }
  }

  cancelEdit() {
    this.editingPatient = null;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.showProfileMenu = false;
    }
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) {
      this.showNotifications = false;
    }
  }

  logout() {
    this.authService.logout();
  }
}