import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as signalR from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private baseUrl = 'http://localhost:5039/api';
  public hubConnection!: signalR.HubConnection;

  constructor(private http: HttpClient) {}

  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5039/chathub', {
        withCredentials: false
      })
      .build();

    return this.hubConnection.start();
  }

  joinChat(chatId: string) {
    return this.hubConnection.invoke('JoinChat', chatId);
  }

  leaveChat(chatId: string) {
    return this.hubConnection.invoke('LeaveChat', chatId);
  }

  sendMessage(chatId: string, senderId: number, senderName: string, message: string) {
    return this.hubConnection.invoke('SendMessage', chatId, senderId, senderName, message);
  }

  onReceiveMessage(callback: (message: any) => void) {
    this.hubConnection.on('ReceiveMessage', callback);
  }

  getOrCreateChat(user1Id: number, user2Id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/Chat/between/${user1Id}/${user2Id}`);
  }

  getUserChats(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Chat/user/${userId}`);
  }

  getMessages(chatId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Chat/${chatId}/messages`);
  }

  saveMessage(message: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Chat/message`, message);
  }

  getDoctorPatients(doctorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Doctors/${doctorId}/patients`);
  }
}