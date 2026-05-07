import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private baseUrl = 'http://localhost:5039/api';

  constructor(private http: HttpClient) {}

  getDoctorByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/Doctors/user/${userId}`);
  }

  getDoctorAppointments(doctorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Appointments/doctor/${doctorId}`);
  }

  getDoctorConsultations(doctorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Consultations/doctor/${doctorId}`);
  }

  getDoctorPatients(doctorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Doctors/${doctorId}/patients`);
  }
  getAllPatients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Patients`);
  }
  createConsultation(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Consultations`, data);
  }
  getDoctorMedicalRecords(doctorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/MedicalRecords/doctor/${doctorId}`);
  }
  updateAppointmentStatus(appointmentId: number, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/Appointments/${appointmentId}/status`, JSON.stringify(status), {
        headers: { 'Content-Type': 'application/json' }
    });
  }
}