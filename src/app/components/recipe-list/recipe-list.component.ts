import { Component, OnInit, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { LoadingService } from '../../services/loading.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit {
  recipes: any[] = [];
  filteredRecipes: any[] = [];

  constructor(
    private recipeService: RecipeService,
    private router: Router,
    private loadingService: LoadingService,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.loadingService.show();
    this.recipeService.getAllRecipes(new Date().getTime()).subscribe({
      next: (data: any[]) => {
        this.ngZone.run(() => {
          this.recipes = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          this.filteredRecipes = this.recipes;
          this.loadingService.hide();
          // Actualizar el almacenamiento local con los datos más recientes solo si estamos en el navegador
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('recipes', JSON.stringify(this.recipes));
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar recetas:', error);
        this.ngZone.run(() => {
          this.loadingService.hide();
        });
      }
    });
  }

  viewRecipe(recipeId: string): void {
    this.router.navigate(['/recipe', recipeId]);
  }

  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredRecipes = this.recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchTerm)
    );
  }

  // Método para forzar una recarga de datos
  forceReload(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('recipes');
    }
    this.loadRecipes();
  }
}
