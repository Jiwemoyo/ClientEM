import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { RestaurantService } from '../../services/restaurant.service'; // Importa el servicio de restaurantes
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-user-profile-view',
  templateUrl: './user-profile-view.component.html',
  styleUrls: ['./user-profile-view.component.css']
})
export class UserProfileViewComponent implements OnInit {
  recipes: any[] = [];
  filteredRecipes: any[] = []; // Nueva propiedad para las recetas filtradas
  restaurants: any[] = []; // Nueva variable para los restaurantes
  username: string = '';

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private restaurantService: RestaurantService, // Inyecta el servicio de restaurantes
    private loadingService: LoadingService, // Inyecta el servicio de carga
    private router: Router
  ) { }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (userId) {
      this.loadingService.show(); // Muestra el indicador de carga
      this.recipeService.getRecipesByUserId(userId).subscribe({
        next: (data: any) => {
          this.recipes = data.map((recipe: { likes: string | any[]; comments: any; }) => {
            return {
              ...recipe,
              likesCount: recipe.likes.length,
              comments: recipe.comments
            };
          });
          this.filteredRecipes = this.recipes; // Inicialmente, todas las recetas están en la lista filtrada
          if (this.recipes.length > 0) {
            this.username = this.recipes[0].author.username;
          }
          this.loadingService.hide(); // Oculta el indicador de carga
        },
        error: (error) => {
          console.error('Error al cargar recetas:', error);
          this.loadingService.hide(); // Oculta el indicador de carga en caso de error
        }
      });

      this.restaurantService.getRestaurantsByUserId(userId).subscribe({
        next: (data: any) => {
          this.restaurants = data;
          this.loadingService.hide(); // Oculta el indicador de carga
        },
        error: (error) => {
          console.error('Error al cargar restaurantes:', error);
          this.loadingService.hide(); // Oculta el indicador de carga en caso de error
        }
      });
    }
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
