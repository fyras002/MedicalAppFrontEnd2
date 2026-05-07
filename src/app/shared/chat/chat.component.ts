import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() otherUserId: number | null = null;
  @Input() otherUserName: string = '';

  messages: any[] = [];
  newMessage: string = '';
  chatId: number | null = null;
  currentUserId: number | null = null;
  currentUserName: string = '';
  isOpen = false;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,

  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.currentUserId = user.id;
    this.currentUserName = `${user.firstname} ${user.lastname}`;
  }

  ngOnDestroy() {
    if (this.chatId) {
      this.chatService.leaveChat(this.chatId.toString());
    }
  }

  async openChat() {
    if (!this.otherUserId || !this.currentUserId) return;
    
    this.isOpen = true;
    
    await this.chatService.startConnection();
    
    this.chatService.getOrCreateChat(this.currentUserId, this.otherUserId).subscribe({
      next: async (chat: any) => {
        this.chatId = chat.idChat;
        await this.chatService.joinChat(this.chatId!.toString());
        this.loadMessages();
        
        this.chatService.onReceiveMessage((msg: any) => {
          this.messages.push(msg);
        });
      }
    });
  }

  loadMessages() {
    if (!this.chatId) return;
    
    this.chatService.getMessages(this.chatId).subscribe({
      next: (msgs) => {
        this.messages = msgs;
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.chatId || !this.currentUserId) return;

    const message = {
      idChat: this.chatId,
      idUserSender: this.currentUserId,
      message: this.newMessage.trim()
    };

    this.chatService.saveMessage(message).subscribe({
      next: () => {
        this.chatService.sendMessage(
          this.chatId!.toString(),
          this.currentUserId!,
          this.currentUserName,
          this.newMessage.trim()
        );
        this.newMessage = '';
        
      }
    });
  }

  closeChat() {
    this.isOpen = false;
    if (this.chatId) {
      this.chatService.leaveChat(this.chatId.toString());
    }
  }
}