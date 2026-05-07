import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  isDarkMode = false;
  private baseUrl = 'http://localhost:5039/api';

  user = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstname: '',
    lastname: '',
    role: 3
  };

  constructor(private http: HttpClient, private router: Router) {}

  register() {
    if (this.user.password !== this.user.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    this.http.post(`${this.baseUrl}/Users`, {
      username: this.user.username,
      email: this.user.email,
      password: this.user.password,
      firstname: this.user.firstname,
      lastname: this.user.lastname,
      role: this.user.role
    }).subscribe({
      next: (newUser: any) => {
        this.http.post(`${this.baseUrl}/Patients`, {
          userId: newUser.id,
          firstname: this.user.firstname,
          lastname: this.user.lastname,
          email: this.user.email,
          active: true
        }).subscribe({
          next: () => {
            alert('Account created! Please login.');
            this.router.navigate(['/login']);
          }
        });
      },
      error: () => alert('Error creating account')
    });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
  }
}