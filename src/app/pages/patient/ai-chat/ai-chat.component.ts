import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

interface TriageRequest {
  patientId: string;
  initialMessage: string;
  patientAge: number;
  patientGender: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientDbId: number;
}

@Component({
  selector: 'app-patient-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.scss']
})
export class PatientAiChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatBody') private chatBody!: ElementRef;

  messages: any[] = [];
  newMessage: string = '';
  patientName: string = '';
  patientEmail: string = '';
  patientAge: number = 0;
  patientGender: string = '';
  patientId: string = '';
  patientDbId: number = 0;
  patientPhone: string = '';
  isTyping: boolean = false;
  showNotifications = false;
  showProfileMenu = false;
  isDarkMode = false;
  upcomingCount = 0;
  myAppointments: any[] = [];
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
    this.patientAge = user.age || 30;
    this.patientGender = user.gender || 'Not specified';
    this.patientId = user.id?.toString() || `patient_${Date.now()}`;
    this.patientDbId = user.dbId || 0;
    this.patientPhone = user.phone || '';
    
    this.loadMyAppointments(user.id);
    
    this.messages = [{
      sender: 'bot',
      text: `Hello ${user.firstname || 'Patient'}! 👋 I'm your AI health assistant powered by advanced medical AI. How are you feeling today? You can describe your symptoms and I'll analyze them to provide guidance.`,
      time: new Date()
    }];
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    try {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    } catch(e) {}
  }

  loadMyAppointments(userId: number) {
    this.http.get<any[]>(`${this.baseUrl}/Patients`).subscribe({
      next: (patients) => {
        const me = patients.find((p: any) => p.userId === userId);
        if (me) {
          this.http.get<any[]>(`${this.baseUrl}/Appointments/patient/${me.idPatient}`).subscribe({
            next: (appointments) => {
              this.myAppointments = appointments;
              const now = new Date();
              this.upcomingCount = appointments.filter((a: any) => 
                new Date(a.dateTimeAppointment) >= now
              ).length;
              this.cdr.markForCheck();
            }
          });
        }
      }
    });
  }

  sendMessage() {
    const text = this.newMessage.trim();
    if (!text) return;

    this.messages.push({ sender: 'user', text, time: new Date() });
    this.newMessage = '';
    this.isTyping = true;
    this.cdr.markForCheck();

    this.callTriageAPI(text);
  }

  callTriageAPI(userMessage: string) {
    const triageRequest: TriageRequest = {
      patientId: this.patientId,
      initialMessage: userMessage,
      patientAge: this.patientAge,
      patientGender: this.patientGender,
      patientName: this.patientName,
      patientEmail: this.patientEmail,
      patientPhone: this.patientPhone,
      patientDbId: this.patientDbId
    };

    this.http.post<any>(`${this.baseUrl}/triage/analyze`, triageRequest)
      .subscribe({
        next: (response) => {
          console.log('API Response:', response);
          this.handleTriageResponse(response);
        },
        error: (error) => {
          console.error('Triage API error:', error);
          this.isTyping = false;
          this.messages.push({
            sender: 'bot',
            text: 'Sorry, I encountered an error analyzing your symptoms. Please try again later.',
            time: new Date()
          });
          this.cdr.markForCheck();
          this.scrollToBottom();
        }
      });
  }

  handleTriageResponse(response: any) {
    this.isTyping = false;
    
    const botMessages: any[] = [];

    const symptoms = response.symptoms || [];
    const urgencyLevel = response.urgency_level || 'Not determined';
    const carePathway = response.care_pathway ? response.care_pathway.replace(/_/g, ' ') : 'Not specified';
    const predictedConditions = response.predicted_conditions || [];
    const clinicalSummary = response.clinical_summary || '';
    const recommendations = response.recommendations || [];
    const disclaimer = response.disclaimer || 'AI-assisted triage. Always consult a qualified healthcare provider.';

    if (symptoms.length > 0) {
      const symptomsList = symptoms.map((s: string) => s.replace(/_/g, ' ')).join(', ');
      botMessages.push({
        sender: 'bot',
        text: `📋 Based on your description, I've identified these symptoms: **${symptomsList}**`,
        time: new Date()
      });
    }

    const urgencyColors: { [key: string]: string } = {
      'EMERGENCY': '🔴',
      'URGENT': '🟠',
      'HIGH': '🟡',
      'MODERATE': '🟢',
      'LOW': '🔵',
      'NON_URGENT': '🔵'
    };
    const urgencyEmoji = urgencyColors[urgencyLevel] || '⚪';
    
    botMessages.push({
      sender: 'bot',
      text: `${urgencyEmoji} **Urgency Level:** ${urgencyLevel.replace(/_/g, ' ')} | **Care Pathway:** ${carePathway}`,
      time: new Date()
    });

    if (predictedConditions.length > 0) {
      const topCondition = predictedConditions[0];
      botMessages.push({
        sender: 'bot',
        text: `🏥 **Most Likely Condition:** ${topCondition.condition || 'Unknown'} (Confidence: ${topCondition.confidence_pct || 0}%)`,
        time: new Date()
      });
    }

    if (clinicalSummary) {
      botMessages.push({
        sender: 'bot',
        text: `📝 **Clinical Summary:** ${clinicalSummary}`,
        time: new Date()
      });
    }

    if (recommendations.length > 0) {
      const recommendationsText = recommendations
        .map((r: string) => `• ${r}`)
        .join('\n');
      botMessages.push({
        sender: 'bot',
        text: `💡 **Recommendations:**\n${recommendationsText}`,
        time: new Date()
      });
    }

    const showBookButton = ['EMERGENCY', 'URGENT', 'HIGH', 'MODERATE'].includes(urgencyLevel);
    
    if (showBookButton) {
      botMessages.push({
        sender: 'bot',
        text: `🚨 Based on this analysis, I recommend scheduling an appointment. Would you like me to help you book one?`,
        time: new Date(),
        showBookButton: true
      });
    }

    botMessages.push({
      sender: 'bot',
      text: `⚠️ ${disclaimer}`,
      time: new Date()
    });

    this.messages.push(...botMessages);
    this.cdr.markForCheck();
    this.scrollToBottom();
  }

  bookAppointment() {
    this.messages.push({
      sender: 'bot',
      text: 'Great! Redirecting you to the appointment booking page... 🏥',
      time: new Date(),
      redirectTo: '/patient/appointments'
    });
    this.cdr.markForCheck();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.cdr.markForCheck();
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) { this.showProfileMenu = false; }
    this.cdr.markForCheck();
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) { this.showNotifications = false; }
    this.cdr.markForCheck();
  }

  logout() {
    this.authService.logout();
  }
}