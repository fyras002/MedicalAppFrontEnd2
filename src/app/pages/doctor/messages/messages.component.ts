import { Component, OnInit } from '@angular/core';
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
    private http: HttpClient
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
          const doctorId = doctor.id;
          
          this.chatService.getDoctorPatients(doctorId).subscribe({
            next: (patients: any[]) => {
              patients.forEach(patient => {
                if (patient.userId) {
                  this.chatService.getOrCreateChat(userId, patient.userId).subscribe();
                }
              });
              
              this.chatService.getUserChats(userId).subscribe({
                next: (chats) => {
                  this.chats = chats;
                }
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
    
    // Get the first patient
    this.http.get<any[]>('http://localhost:5039/api/Patients').subscribe({
      next: (patients) => {
        if (patients.length > 0) {
          const patient = patients[0];
          if (patient.userId) {
            this.chatService.getOrCreateChat(userId, patient.userId).subscribe({
              next: (chat) => {
                console.log('Chat created:', chat);
                this.loadChats();
              }
            });
          }
        }
      }
    });
  }

  async openChat(chat: any) {
    this.selectedChat = chat;
    this.messages = [];
    await this.chatService.joinChat(chat.idChat.toString());
    
    this.chatService.getMessages(chat.idChat).subscribe({
      next: (msgs) => {
        this.messages = msgs;
      }
    });

    this.chatService.hubConnection.off('ReceiveMessage');
    
    this.chatService.onReceiveMessage((msg: any) => {
      this.messages.push(msg);
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedChat || !this.currentUserId) return;

    const message = {
      idChat: this.selectedChat.idChat,
      idUserSender: this.currentUserId,
      message: this.newMessage.trim()
    };

    this.chatService.saveMessage(message).subscribe({
      next: () => {
        this.chatService.sendMessage(
          this.selectedChat.idChat.toString(),
          this.currentUserId!,
          this.currentUserName,
          this.newMessage.trim()
        );
        this.newMessage = '';
      }
    });
  }

  leaveChat() {
    if (this.selectedChat) {
      this.chatService.leaveChat(this.selectedChat.idChat.toString());
      this.selectedChat = null;
      this.messages = [];
    }
  }

  logout() {
    this.authService.logout();
  }
}