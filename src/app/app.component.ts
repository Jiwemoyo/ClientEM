import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  loading$ = this.loadingService.isLoading$;

  constructor(
    private loadingService: LoadingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Mostrar loading al iniciar la aplicación
      this.loadingService.show();

      // Ocultar loading cuando la página haya cargado completamente
      window.addEventListener('load', () => {
        this.loadingService.hide();
      });

      // Mostrar loading cuando se inicia una recarga de página
      window.addEventListener('beforeunload', () => {
        this.loadingService.show();
      });
    }
  }
}
