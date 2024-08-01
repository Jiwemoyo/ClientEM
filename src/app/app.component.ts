import { Component, ChangeDetectorRef } from '@angular/core';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  loading$ = this.loadingService.loading$;

  constructor(
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {
    this.loading$.subscribe(() => {
      this.cdr.detectChanges();
    });
  }
}
