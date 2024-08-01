import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  menuActive: boolean = false;
  private authSubscription: Subscription | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn().subscribe((status: boolean) => {
      this.isLoggedIn = status;
      if (status) {
        this.checkAdminStatus();
      } else {
        this.isAdmin = false;
      }
    });
  }

  checkAdminStatus(): void {
    const userRole = this.authService.getUserRole();
    this.isAdmin = userRole === 'admin'; // Asumimos que el rol de administrador se llama 'admin'
  }

  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
