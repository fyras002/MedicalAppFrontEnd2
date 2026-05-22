import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-doctor-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class DoctorMessagesComponent implements OnInit {
  chats: any[] = [];
  messages: any[] = [];
  selectedChat: any = null;
  newMessage: string = '';
  currentUserId: number | null = null;
  currentUserName: string = '';
  doctorName: string = '';

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
    this.doctorName = this.currentUserName;
    this.loadChats();
    await this.chatService.startConnection();
  }

  loadChats() {
    if (!this.currentUserId) return;
    const userId = this.currentUserId;
    this.http.get<any[]>(`http://localhost:5039/api/Doctors/user/${userId}`).subscribe({
      next: (doctors) => {
        const doctor = doctors[0];
        if (doctor) {
          this.chatService.getDoctorPatients(doctor.id).subscribe({
            next: (patients: any[]) => {
              patients.forEach(patient => {
                if (patient.userId) { this.chatService.getOrCreateChat(userId, patient.userId).subscribe(); }
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
    this.http.get<any[]>('http://localhost:5039/api/Patients').subscribe({
      next: (patients) => {
        if (patients.length > 0 && patients[0].userId) {
          this.chatService.getOrCreateChat(userId, patients[0].userId).subscribe({
            next: () => { this.loadChats(); this.cdr.markForCheck(); }
          });
        }
      }
    });
  }

  async openChat(chat: any) {
    this.selectedChat = chat; this.messages = [];
    await this.chatService.joinChat(chat.idChat.toString());
    this.chatService.getMessages(chat.idChat).subscribe({
      next: (msgs) => { this.messages = msgs; this.cdr.markForCheck(); }
    });
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

  logout() { this.authService.logout(); }
}