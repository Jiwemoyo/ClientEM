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

  constructor(private authService: AuthService, private router: Router) { }

  register() {
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
}
