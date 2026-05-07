import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  doctors: any[] = [];
  totalPatients = 0;
  totalDoctors = 0;
  totalAppointments = 0;

  careOptions = [
    { icon: 'fa-calendar-check', label: 'Online Appointments' },
    { icon: 'fa-file-medical-alt', label: 'Digital Medical Records' },
    { icon: 'fa-comments', label: 'Doctor-Patient Chat' },
  ];

  constructor(private http: HttpClient,private cdr :ChangeDetectorRef) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:5039/api/Doctors').subscribe({
      next: (data) => {
        this.doctors = data.slice(0, 4);
        this.totalDoctors = data.length;
        this.cdr.markForCheck();
      }
    });

    this.http.get<any[]>('http://localhost:5039/api/Patients').subscribe({
      next: (data) => {
        this.totalPatients = data.length;
        this.cdr.markForCheck();
      }
    });

    this.http.get<any[]>('http://localhost:5039/api/Appointments').subscribe({
      next: (data) => {
        this.totalAppointments = data.length;
        this.cdr.markForCheck();
      }
    });
  }
}