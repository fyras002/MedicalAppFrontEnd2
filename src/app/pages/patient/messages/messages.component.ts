import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-patient-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class PatientMessagesComponent implements OnInit {
  chats: any[] = [];
  messages: any[] = [];
  selectedChat: any = null;
  newMessage: string = '';
  currentUserId: number | null = null;
  currentUserName: string = '';
  patientName: string = '';
  patientEmail: string = '';
  isDarkMode = false;
  showNotifications = false;
  showProfileMenu = false;
  upcomingCount = 0;
  myAppointments: any[] = [];
  private baseUrl = 'http://localhost:5039/api';

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const user = this.authService.getUser();
    this.currentUserId = user.id;
    this.currentUserName = `${user.firstname} ${user.lastname}`;
    this.patientName = this.currentUserName;
    this.patientEmail = user.email || '';
    this.loadAppointments(user.id);
    this.loadChats();
    await this.chatService.startConnection();
  }

  loadAppointments(userId: number) {
    this.http.get<any[]>(`${this.baseUrl}/Patients`).subscribe({
      next: (patients) => {
        const me = patients.find((p: any) => p.userId === userId);
        if (me) {
          this.http.get<any[]>(`${this.baseUrl}/Appointments/patient/${me.idPatient}`).subscribe({
            next: (appointments) => {
              this.myAppointments = appointments;
              this.upcomingCount = appointments.filter((a: any) => new Date(a.dateTimeAppointment) >= new Date()).length;
              this.cdr.markForCheck();
            }
          });
        }
      }
    });
  }

  loadChats() {
    if (!this.currentUserId) return;
    const userId = this.currentUserId;
    this.http.get<any[]>(`${this.baseUrl}/Patients`).subscribe({
      next: (patients) => {
        const me = patients.find((p: any) => p.userId === userId);
        if (me) {
          this.http.get<any[]>(`${this.baseUrl}/Appointments/patient/${me.idPatient}`).subscribe({
            next: (appointments) => {
              const doctorIds = [...new Set(appointments.map((a: any) => a.idDoctor))];
              doctorIds.forEach((doctorId: any) => {
                this.http.get<any>(`${this.baseUrl}/Doctors/${doctorId}`).subscribe({
                  next: (doctor: any) => {
                    if (doctor && doctor.userId) { this.chatService.getOrCreateChat(userId, doctor.userId).subscribe(); }
                  }
                });
              });
              this.chatService.getUserChats(userId).subscribe({
                next: (chats) => { this.chats = chats; this.cdr.markForCheck(); }
              });
            }
          });
        }
      }
    });
  }

  createTestChat() {
    const userId = this.currentUserId;
    if (!userId) return;
    this.http.get<any[]>('http://localhost:5039/api/Doctors').subscribe({
      next: (doctors) => {
        if (doctors.length > 0 && doctors[0].userId) {
          this.chatService.getOrCreateChat(userId, doctors[0].userId).subscribe({ next: () => this.loadChats() });
        }
      }
    });
  }

  async openChat(chat: any) {
    this.selectedChat = chat; this.messages = [];
    await this.chatService.joinChat(chat.idChat.toString());
    this.chatService.getMessages(chat.idChat).subscribe({ next: (msgs) => { this.messages = msgs; this.cdr.markForCheck(); } });
    this.chatService.hubConnection.off('ReceiveMessage');
    this.chatService.onReceiveMessage((msg: any) => { this.messages.push(msg); this.cdr.markForCheck(); });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedChat || !this.currentUserId) return;
    const msg = { idChat: this.selectedChat.idChat, idUserSender: this.currentUserId, message: this.newMessage.trim() };
    this.chatService.saveMessage(msg).subscribe({
      next: () => {
        this.chatService.sendMessage(this.selectedChat.idChat.toString(), this.currentUserId!, this.currentUserName, this.newMessage.trim());
        this.newMessage = ''; this.cdr.markForCheck();
      }
    });
  }

  leaveChat() {
    if (this.selectedChat) { this.chatService.leaveChat(this.selectedChat.idChat.toString()); this.selectedChat = null; this.messages = []; this.cdr.markForCheck(); }
  }

  toggleDarkMode() { this.isDarkMode = !this.isDarkMode; this.cdr.markForCheck(); }
  toggleNotifications() { this.showNotifications = !this.showNotifications; if (this.showNotifications) this.showProfileMenu = false; this.cdr.markForCheck(); }
  toggleProfileMenu() { this.showProfileMenu = !this.showProfileMenu; if (this.showProfileMenu) this.showNotifications = false; this.cdr.markForCheck(); }
  logout() { this.authService.logout(); }
}