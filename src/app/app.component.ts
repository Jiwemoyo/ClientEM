import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  loading$ = this.loadingService.loading$;

  constructor(
    private loadingService: LoadingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadingService.show();
      });

      window.addEventListener('load', () => {
        setTimeout(() => {
          this.loadingService.hide();
        });
      });

      window.addEventListener('beforeunload', () => {
        setTimeout(() => {
          this.loadingService.show();
        });
      });
    }
  }
}
