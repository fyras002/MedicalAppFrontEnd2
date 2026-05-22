import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { RoleGuard } from './guards/role-guard';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AdminDashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { AdminUsersComponent } from './pages/admin/users/users.component';
import { AdminDoctorsComponent } from './pages/admin/doctors/doctors.component';
import { AdminPatientsComponent } from './pages/admin/patients/patients.component';
import { AdminAppointmentsComponent } from './pages/admin/appointments/appointments.component';
import { AdminMedicalRecordsComponent } from './pages/admin/medical-records/medical-records.component';
import { AdminSpecialitiesComponent } from './pages/admin/specialities/specialities.component';
import { DoctorDashboardComponent } from './pages/doctor/dashboard/dashboard.component';
import { DoctorAppointmentsComponent } from './pages/doctor/appointments/appointments.component';
import { DoctorPatientsComponent } from './pages/doctor/patients/patients.component';
import { DoctorConsultationsComponent } from './pages/doctor/consultations/consultations.component';
import { DoctorMedicalRecordsComponent } from './pages/doctor/medical-records/medical-records.component';
import { DoctorMessagesComponent } from './pages/doctor/messages/messages.component';
import { DoctorHealthCourseComponent } from './pages/doctor/health-course/health-course.component';
import { PatientDashboardComponent } from './pages/patient/dashboard/dashboard.component';
import { PatientAppointmentsComponent } from './pages/patient/appointments/appointments.component';
import { PatientMedicalRecordsComponent } from './pages/patient/medical-records/medical-records.component';
import { PatientMessagesComponent } from './pages/patient/messages/messages.component';
import { PatientAiChatComponent } from './pages/patient/ai-chat/ai-chat.component';
import { PatientHealthTipsComponent } from './pages/patient/health-tips/health-tips.component';
import { HomeComponent } from './pages/home/home.component';
import { MedicationListComponent } from './pages/doctor/medication-list/medication-list.component';


export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'admin',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent, canActivate: [RoleGuard], data: { role: 1 } },
      { path: 'users', component: AdminUsersComponent, canActivate: [RoleGuard], data: { role: 1 } },
      { path: 'doctors', component: AdminDoctorsComponent, canActivate: [RoleGuard], data: { role: 1 } },
      { path: 'patients', component: AdminPatientsComponent, canActivate: [RoleGuard], data: { role: 1 } },
      { path: 'appointments', component: AdminAppointmentsComponent, canActivate: [RoleGuard], data: { role: 1 } },
      { path: 'medical-records', component: AdminMedicalRecordsComponent, canActivate: [RoleGuard], data: { role: 1 } },
      { path: 'specialities', component: AdminSpecialitiesComponent, canActivate: [RoleGuard], data: { role: 1 } },
    ]
  },

  {
    path: 'doctor',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DoctorDashboardComponent, canActivate: [RoleGuard], data: { role: 2 } },
      { path: 'appointments', component: DoctorAppointmentsComponent, canActivate: [RoleGuard], data: { role: 2 } },
      { path: 'patients', component: DoctorPatientsComponent, canActivate: [RoleGuard], data: { role: 2 } },
      { path: 'consultations', component: DoctorConsultationsComponent, canActivate: [RoleGuard], data: { role: 2 } },
      { path: 'medical-records', component: DoctorMedicalRecordsComponent, canActivate: [RoleGuard], data: { role: 2 } },
      { path: 'medical-records/:patientId', component: DoctorMedicalRecordsComponent, canActivate: [RoleGuard], data: { role: 2 } },
      { path: 'messages', component: DoctorMessagesComponent, canActivate: [RoleGuard], data: { role: 2 } },
      { path: 'health-course', component: DoctorHealthCourseComponent, canActivate: [RoleGuard], data: { role: 2 } },
      { path: 'medications', component: MedicationListComponent, canActivate: [RoleGuard], data: { role: 2 } },
    ]
  },

  {
    path: 'patient',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: PatientDashboardComponent, canActivate: [RoleGuard], data: { role: 3 } },
      { path: 'appointments', component: PatientAppointmentsComponent, canActivate: [RoleGuard], data: { role: 3 } },
      { path: 'medical-records', component: PatientMedicalRecordsComponent, canActivate: [RoleGuard], data: { role: 3 } },
      { path: 'messages', component: PatientMessagesComponent, canActivate: [RoleGuard], data: { role: 3 } },
      { path: 'ai-chat', component: PatientAiChatComponent, canActivate: [RoleGuard], data: { role: 3 } },
      { path: 'health-tips', component: PatientHealthTipsComponent, canActivate: [RoleGuard], data: { role: 3 } },
    ]
  },

  { path: '**', redirectTo: '/login' },
];