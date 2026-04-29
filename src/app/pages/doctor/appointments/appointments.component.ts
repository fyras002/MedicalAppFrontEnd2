import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class DoctorAppointmentsComponent implements OnInit {
  appointments: any[] = [];

  constructor(
    private authService: AuthService,
    private doctorService: DoctorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.loadAppointments(user.id);
  }

  loadAppointments(userId: number) {
    this.doctorService.getDoctorByUserId(userId).subscribe({
      next: (doctors) => {
        const doctor = doctors[0];
        if (doctor) {
          this.doctorService.getDoctorAppointments(doctor.id).subscribe({
            next: (appointments) => {
              this.appointments = appointments;
              this.cdr.detectChanges();
            }
          });
        }
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}