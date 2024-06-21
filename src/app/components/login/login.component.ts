// login.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
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
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.userId); // Guardar el userId en localStorage
        this.router.navigate(['/profile']);
      },
      error => this.errorMessage = error.error.message
    );
  }
}
