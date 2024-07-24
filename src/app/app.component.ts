import { Component, HostListener } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'clientEasyMenu';

  constructor(private authService: AuthService) {}

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event: Event) {
    this.authService.logout();
  }
}
