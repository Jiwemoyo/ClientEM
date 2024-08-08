import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  emailPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";

  constructor(private authService: AuthService, private router: Router) { }

  register() {
    if (!this.validateEmail() || this.password.length < 5) {
      this.errorMessage = "Por favor, ingresa un correo electrónico válido y una contraseña de al menos 6 caracteres.";
      return;
    }

    const userData = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.authService.register(userData).subscribe(
      () => this.router.navigate(['/login']),
      error => this.errorMessage = error.error.message
    );
  }

  validateEmail(): boolean {
    const regex = new RegExp(this.emailPattern);
    return regex.test(this.email);
  }
}
