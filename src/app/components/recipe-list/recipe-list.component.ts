import { Component, OnInit } from '@angular/core';
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
    private loadingService: LoadingService // Inyecta el servicio de carga
  ) { }

  ngOnInit(): void {
    this.loadRecipes(); // Llama al método para cargar las recetas
  }

  loadRecipes(): void {
    this.loadingService.show(); // Muestra el indicador de carga
    this.recipeService.getAllRecipes().subscribe({
      next: (data: any[]) => {
        this.recipes = data;
        this.filteredRecipes = data; // Inicialmente, todas las recetas están en la lista filtrada
        this.loadingService.hide(); // Oculta el indicador de carga
      },
      error: (error) => {
        console.error('Error al cargar recetas:', error);
        this.loadingService.hide(); // Oculta el indicador de carga en caso de error
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
