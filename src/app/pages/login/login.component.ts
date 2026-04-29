import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    if (!this.username || !this.password) {
      alert('Please enter username and password');
      return;
    }

    this.authService.login(this.username, this.password).subscribe({
      next: (user) => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));

          if (user.role === 1) {
            this.router.navigate(['/admin/dashboard']);
          } else if (user.role === 2) {
            this.router.navigate(['/doctor/dashboard']);
          } else if (user.role === 3) {
            this.router.navigate(['/patient/dashboard']);
          } else {
            this.router.navigate(['/login']);
          }
        } else {
          alert('Invalid username or password');
        }
      },
      error: () => {
        alert('Invalid username or password');
      }
    });
  }
}