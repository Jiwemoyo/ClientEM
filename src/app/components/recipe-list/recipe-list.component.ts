import { Component, OnInit,NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { LoadingService } from '../../services/loading.service'; // Asegúrate de importar el servicio de carga

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
    private loadingService: LoadingService, // Inyecta el servicio de carga
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.loadingService.show();
    this.recipeService.getAllRecipes().subscribe({
      next: (data: any[]) => {
        this.ngZone.run(() => {
          this.recipes = data;
          this.filteredRecipes = data;
          this.loadingService.hide();
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
}
