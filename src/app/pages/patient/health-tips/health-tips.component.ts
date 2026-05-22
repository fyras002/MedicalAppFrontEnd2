import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-patient-health-tips',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './health-tips.component.html',
  styleUrls: ['./health-tips.component.scss']
})
export class PatientHealthTipsComponent implements OnInit {
  tips: any[] = [];
  patientName: string = '';
  patientEmail: string = '';
  patientId: number | null = null;
  showNotifications = false;
  showProfileMenu = false;
  isDarkMode = false;
  selectedTipId: number | null = null;
  
  // Grouped tips
  foodsToEat: string[] = [];
  foodsToAvoid: string[] = [];
  lifestyleToDo: string[] = [];
  lifestyleToAvoid: string[] = [];
  regularTips: any[] = [];
  hasRichPlan = false;
  
  private baseUrl = 'http://localhost:5039/api';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.patientName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Patient';
    this.patientEmail = user.email || '';
    this.loadPatientId(user.id);
  }

  loadPatientId(userId: number) {
    this.http.get<any[]>(`${this.baseUrl}/Patients`).subscribe({
      next: (patients) => {
        const me = patients.find((p: any) => p.userId === userId);
        if (me) {
          this.patientId = me.idPatient;
          this.loadTips(me.idPatient);
        }
      }
    });
  }

  loadTips(patientId: number) {
    this.http.get<any[]>(`${this.baseUrl}/HealthTip/patient/${patientId}`).subscribe({
      next: (tips) => {
        this.tips = tips;
        this.categorizeTips(tips);
        this.cdr.markForCheck();
      }
    });
  }

  categorizeTips(tips: any[]) {
    this.foodsToEat = [];
    this.foodsToAvoid = [];
    this.lifestyleToDo = [];
    this.lifestyleToAvoid = [];
    this.regularTips = [];
    
    tips.forEach(tip => {
      const content = tip.content || '';
      if (content.includes('[🥗 EAT]')) {
        this.foodsToEat.push(content.replace('[🥗 EAT]', '').trim());
      } else if (content.includes('[⚠️ AVOID]')) {
        this.foodsToAvoid.push(content.replace('[⚠️ AVOID]', '').trim());
      } else if (content.includes('[✅ DO]')) {
        this.lifestyleToDo.push(content.replace('[✅ DO]', '').trim());
      } else if (content.includes('[❌ DON\'T]')) {
        this.lifestyleToAvoid.push(content.replace('[❌ DON\'T]', '').trim());
      } else {
        this.regularTips.push(tip);
      }
    });
    
    this.hasRichPlan = this.foodsToEat.length > 0 || this.foodsToAvoid.length > 0 || 
                        this.lifestyleToDo.length > 0 || this.lifestyleToAvoid.length > 0;
  }

  markAsRead(tipId: number) {
    this.http.put(`${this.baseUrl}/HealthTip/${tipId}/read`, {}).subscribe({
      next: () => { this.loadTips(this.patientId!); }
    });
  }

  markAllAsRead() {
  this.tips.forEach(tip => {
    if (tip.status === 'Sent') {
      this.http.put(`${this.baseUrl}/HealthTip/${tip.id}/read`, {}).subscribe({
        next: () => {
          // Reload after all are marked
          this.loadTips(this.patientId!);
        },
        error: (err) => console.error('Error marking as read:', err)
      });
    }
  });
}

  toggleDarkMode() { this.isDarkMode = !this.isDarkMode; this.cdr.markForCheck(); }
  toggleNotifications() { this.showNotifications = !this.showNotifications; if (this.showNotifications) this.showProfileMenu = false; }
  toggleProfileMenu() { this.showProfileMenu = !this.showProfileMenu; if (this.showProfileMenu) this.showNotifications = false; }
  logout() { this.authService.logout(); }
}