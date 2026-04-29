import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'app-doctor-patients',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss']
})
export class DoctorPatientsComponent implements OnInit {
  patients: any[] = [];

  constructor(
    private authService: AuthService,
    private doctorService: DoctorService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.doctorService.getAllPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.cdr.detectChanges();
      }
    });
  }

  viewMedicalRecord(patient: any) {
    this.router.navigate(['/doctor/medical-records', patient.idPatient]);
  }

  logout() {
    this.authService.logout();
  }
}