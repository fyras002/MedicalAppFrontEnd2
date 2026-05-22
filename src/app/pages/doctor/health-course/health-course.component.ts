import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-doctor-health-course',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './health-course.component.html',
  styleUrls: ['./health-course.component.scss']
})
export class DoctorHealthCourseComponent implements OnInit {
  doctorName: string = '';
  doctorEmail: string = '';
  doctorId: number = 0;
  speciality: string = '';
  isDarkMode = false;
  showNotifications = false;
  showProfileMenu = false;

  patients: any[] = [];
  selectedPatientId: number | null = null;
  selectedPatientName: string = '';
  selectedPatientDetails: any = null;
  pendingTips: any[] = [];
  sentTips: any[] = [];
  richTips: any = null;
  isGeneratingRich = false;
  editingTipId: number | null = null;
  editingContent: string = '';

  // New properties for rich plan editing
  isEditingRichPlan = false;
  editingRichPlan: any = {
    foodsToEat: [],
    foodsToAvoid: [],
    lifestyleHabitsToDo: [],
    lifestyleHabitsToAvoid: []
  };

  private baseUrl = 'http://localhost:5039/api';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
  const user = this.authService.getUser();
  this.doctorName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Doctor';
  this.doctorEmail = user.email || '';
  this.speciality = user.speciality || 'General Medicine';
  
  
  this.http.get<any[]>(`${this.baseUrl}/Doctors`).subscribe({
    next: (doctors) => {
      const doctor = doctors.find((d: any) => d.userId === user.id );
      if (doctor) {
        this.doctorId = doctor.idDoctor || doctor.id;
        this.speciality = doctor.speciality || this.speciality;
        this.loadPatients();
      } else {
        console.error('Doctor profile not found for user:', user.id);
        this.doctorId = 0;
      }
      this.cdr.markForCheck();
    },
    error: (err) => {
      console.error('Error fetching doctor profile:', err);
      // Fallback
      this.doctorId = user.doctorId || 0;
      this.loadPatients();
    }
  });
}

  
  loadPatients() {
  this.http.get<any[]>(`${this.baseUrl}/doctors/${this.doctorId}/patients`).subscribe({
    next: (patients) => {
      this.patients = patients;
      this.cdr.markForCheck();
    },
    error: (err) => console.error('Error loading patients:', err)
  });
}

  selectPatient(patient: any) {
    this.selectedPatientId = patient.idPatient;
    this.selectedPatientName = `${patient.firstname} ${patient.lastname}`;
    this.richTips = null;
    this.isEditingRichPlan = false;
    this.selectedPatientDetails = null;
    this.loadPatientTips(patient.idPatient);
  }

  loadPatientTips(patientId: number) {
    this.http.get<any[]>(`${this.baseUrl}/HealthTip/doctor/${this.doctorId}`).subscribe({
      next: (tips) => {
        const patientTips = tips.filter(t => t.patientId === patientId);
        this.pendingTips = patientTips.filter(t => t.status === 'Draft');
        this.sentTips = patientTips.filter(t => t.status === 'Sent' || t.status === 'Read');
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading tips:', err)
    });
  }

  generateRichTips() {
  if (!this.selectedPatientId) return;

  this.isGeneratingRich = true;

  // First, fetch the patient's medical record
  this.http.get<any>(`${this.baseUrl}/MedicalRecords/patient/${this.selectedPatientId}`).subscribe({
    next: (medicalRecord) => {
      // Now call generate-rich with real data from medical record
      const request = {
        doctorId: this.doctorId,
        patientId: this.selectedPatientId,
        patientAge: '',
        conditions: medicalRecord?.chronicDiseases || '',
        medications: medicalRecord?.medications || ''
      };

      this.http.post<any>(`${this.baseUrl}/HealthTip/generate-rich`, request).subscribe({
        next: (response) => {
          this.richTips = response;
          this.isGeneratingRich = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error generating rich tips:', err);
          this.isGeneratingRich = false;
          alert('Failed to generate health plan. Please try again.');
          this.cdr.markForCheck();
        }
      });
    },
    error: (err) => {
      console.error('Error fetching medical record:', err);
      // Try without medical record data
      const request = {
        doctorId: this.doctorId,
        patientId: this.selectedPatientId,
        patientAge: '',
        conditions: '',
        medications: ''
      };

      this.http.post<any>(`${this.baseUrl}/HealthTip/generate-rich`, request).subscribe({
        next: (response) => {
          this.richTips = response;
          this.isGeneratingRich = false;
          this.cdr.markForCheck();
        },
        error: (err2) => {
          console.error('Error generating rich tips:', err2);
          this.isGeneratingRich = false;
          alert('Failed to generate health plan. Please try again.');
          this.cdr.markForCheck();
        }
      });
    }
  });
}
  trackByIndex(index: number, item: any): number {
  return index;
  }

  

  // Start editing the rich plan
  startEditRichPlan() {
    this.isEditingRichPlan = true;
    this.editingRichPlan = {
      foodsToEat: [...(this.richTips?.foodsToEat || [])],
      foodsToAvoid: [...(this.richTips?.foodsToAvoid || [])],
      lifestyleHabitsToDo: [...(this.richTips?.lifestyleHabitsToDo || [])],
      lifestyleHabitsToAvoid: [...(this.richTips?.lifestyleHabitsToAvoid || [])]
    };
  }

  // Cancel editing
  cancelEditRichPlan() {
    this.isEditingRichPlan = false;
    this.editingRichPlan = {
      foodsToEat: [],
      foodsToAvoid: [],
      lifestyleHabitsToDo: [],
      lifestyleHabitsToAvoid: []
    };
  }

  // Save the edited rich plan
  saveEditedRichPlan() {
    if (this.editingRichPlan.foodsToEat.length === 0 && 
        this.editingRichPlan.foodsToAvoid.length === 0 && 
        this.editingRichPlan.lifestyleHabitsToDo.length === 0 && 
        this.editingRichPlan.lifestyleHabitsToAvoid.length === 0) {
      alert('Please add at least one item to the health plan.');
      return;
    }

    this.richTips = {
      ...this.richTips,
      foodsToEat: [...this.editingRichPlan.foodsToEat],
      foodsToAvoid: [...this.editingRichPlan.foodsToAvoid],
      lifestyleHabitsToDo: [...this.editingRichPlan.lifestyleHabitsToDo],
      lifestyleHabitsToAvoid: [...this.editingRichPlan.lifestyleHabitsToAvoid]
    };

    this.isEditingRichPlan = false;
    this.cdr.markForCheck();
  }

  // Add a new empty item to an edit list
  addEditItem(field: string) {
    if (!this.editingRichPlan[field]) return;
    this.editingRichPlan[field].push('');
    this.cdr.markForCheck();
  }

  // Remove an item from an edit list
  removeEditItem(field: string, index: number) {
    if (!this.editingRichPlan[field]) return;
    this.editingRichPlan[field].splice(index, 1);
    this.cdr.markForCheck();
  }

  // Send rich tips to patient
  sendRichTips() {
    if (!this.selectedPatientId || !this.richTips) {
      alert('No health plan to send.');
      return;
    }

    if (confirm(`Send this health plan to ${this.selectedPatientName}?`)) {
      const request = {
        doctorId: this.doctorId,
        patientId: this.selectedPatientId,
        foodsToEat: this.richTips.foodsToEat,
        foodsToAvoid: this.richTips.foodsToAvoid,
        lifestyleHabitsToDo: this.richTips.lifestyleHabitsToDo,
        lifestyleHabitsToAvoid: this.richTips.lifestyleHabitsToAvoid
      };

      this.http.post(`${this.baseUrl}/HealthTip/send-rich`, request).subscribe({
        next: () => {
          alert('Health plan sent to patient successfully!');
          this.richTips = null;
          this.isEditingRichPlan = false;
          this.loadPatientTips(this.selectedPatientId!);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error sending health plan:', err);
          alert('Failed to send health plan. Please try again.');
        }
      });
    }
  }

  // Clear the rich plan
  clearRichPlan() {
    if (confirm('Are you sure you want to clear this health plan? This action cannot be undone.')) {
      this.richTips = null;
      this.isEditingRichPlan = false;
      this.cdr.markForCheck();
    }
  }

  getCategory(content: string): string {
    if (content.includes('[🥗 EAT]')) return '🥗 EAT';
    if (content.includes('[⚠️ AVOID]')) return '⚠️ AVOID';
    if (content.includes('[✅ DO]')) return '✅ DO';
    if (content.includes('[❌ DON\'T]')) return '❌ DON\'T';
    return '💡 TIP';
  }

  getContentWithoutCategory(content: string): string {
    return content.replace(/\[.*?\]\s*/, '');
  }

  startEdit(tip: any) {
    this.editingTipId = tip.id;
    this.editingContent = this.getContentWithoutCategory(tip.content);
  }

  cancelEdit() {
    this.editingTipId = null;
    this.editingContent = '';
  }

  saveEdit(tipId: number) {
    if (!this.editingContent.trim()) return;

    const originalTip = this.pendingTips.find(t => t.id === tipId);
    const category = originalTip ? this.getCategory(originalTip.content) : '💡 TIP';
    const newContent = `[${category}] ${this.editingContent.trim()}`;

    this.http.put(`${this.baseUrl}/HealthTip/${tipId}`, { content: newContent }).subscribe({
      next: () => {
        this.editingTipId = null;
        this.editingContent = '';
        this.loadPatientTips(this.selectedPatientId!);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error updating tip:', err);
        alert('Failed to update tip.');
      }
    });
  }

  approveAndSend(tipId: number) {
    if (confirm('Approve and send this tip to the patient?')) {
      this.http.put(`${this.baseUrl}/HealthTip/${tipId}`, { status: 'Sent' }).subscribe({
        next: () => {
          this.loadPatientTips(this.selectedPatientId!);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error sending tip:', err);
          alert('Failed to send tip.');
        }
      });
    }
  }

  deleteTip(tipId: number) {
    if (confirm('Delete this tip?')) {
      this.http.delete(`${this.baseUrl}/HealthTip/${tipId}`).subscribe({
        next: () => {
          this.loadPatientTips(this.selectedPatientId!);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error deleting tip:', err);
          alert('Failed to delete tip.');
        }
      });
    }
  }

  sendAllPendingTips() {
    if (this.pendingTips.length === 0) {
      alert('No pending tips to send.');
      return;
    }

    if (confirm(`Send all ${this.pendingTips.length} pending tips to the patient?`)) {
      const tipIds = this.pendingTips.map(t => t.id);
      
      this.http.post(`${this.baseUrl}/HealthTip/send`, {
        doctorId: this.doctorId,
        tipIds: tipIds
      }).subscribe({
        next: () => {
          this.richTips = null;
          this.loadPatientTips(this.selectedPatientId!);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error sending tips:', err);
          alert('Failed to send tips.');
        }
      });
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.cdr.markForCheck();
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) this.showProfileMenu = false;
    this.cdr.markForCheck();
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) this.showNotifications = false;
    this.cdr.markForCheck();
  }

  logout() {
    this.authService.logout();
  }
}