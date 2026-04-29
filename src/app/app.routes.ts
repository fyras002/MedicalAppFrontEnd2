import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DoctorDashboardComponent } from './pages/doctor/dashboard/dashboard.component';
import { AdminDashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { DoctorAppointmentsComponent } from './pages/doctor/appointments/appointments.component';
import { DoctorPatientsComponent } from './pages/doctor/patients/patients.component';
import { DoctorConsultationsComponent } from './pages/doctor/consultations/consultations.component';
import { DoctorMedicalRecordsComponent } from './pages/doctor/medical-records/medical-records.component';
import { PatientDashboardComponent } from './pages/patient/dashboard/dashboard.component';
import { PatientAppointmentsComponent } from './pages/patient/appointments/appointments.component';
import { PatientMedicalRecordsComponent } from './pages/patient/medical-records/medical-records.component';
import { RegisterComponent } from './pages/register/register.component';
import { AdminUsersComponent } from './pages/admin/users/users.component';
import { AdminDoctorsComponent } from './pages/admin/doctors/doctors.component';
import { AdminSpecialitiesComponent } from './pages/admin/specialities/specialities.component';
import { AdminPatientsComponent } from './pages/admin/patients/patients.component';
import { AdminAppointmentsComponent } from './pages/admin/appointments/appointments.component';
import { AdminMedicalRecordsComponent } from './pages/admin/medical-records/medical-records.component';













export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'doctor/dashboard', component: DoctorDashboardComponent },
  { path: 'patient/dashboard', component: PatientDashboardComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'doctor/appointments', component: DoctorAppointmentsComponent },
  { path: 'doctor/patients', component: DoctorPatientsComponent },
  { path: 'doctor/consultations', component: DoctorConsultationsComponent },
  { path: 'doctor/medical-records', component: DoctorMedicalRecordsComponent },
  { path: 'doctor/medical-records/:patientId', component: DoctorMedicalRecordsComponent },
  { path: 'patient/appointments', component: PatientAppointmentsComponent },
  { path: 'patient/medical-records', component: PatientMedicalRecordsComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'admin/users', component: AdminUsersComponent },
  { path: 'admin/doctors', component: AdminDoctorsComponent },
  { path: 'admin/specialities', component: AdminSpecialitiesComponent },
  { path: 'admin/patients', component: AdminPatientsComponent },
  { path: 'admin/appointments', component: AdminAppointmentsComponent },
  { path: 'admin/medical-records', component: AdminMedicalRecordsComponent },

];