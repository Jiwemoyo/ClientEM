import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  login() {
    const userData = {
      email: this.email,
      password: this.password
    };

    this.authService.login(userData).subscribe(
      response => {
        localStorage.setItem('token', response.token); // Guarda el token en localStorage
        if (response.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/profile']);
        }
      },
      error => this.errorMessage = error.error.message
    );
  }
}
