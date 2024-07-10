import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { RestaurantService } from '../../services/restaurant.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  recipes: any[] = [];
  filteredRecipes: any[] = [];
  searchTerm: string = '';
  restaurants: any[] = [];
  recipeForm: FormGroup;
  restaurantForm: FormGroup;
  token: string | null;
  isEditing: boolean = false;
  isCreating: boolean = false;
  isEditingRestaurant: boolean = false;
  isCreatingRestaurant: boolean = false;
  currentRecipeId: string | null = null;
  currentRestaurantId: string | null = null;

  constructor(
    private recipeService: RecipeService,
    private localStorageService: LocalStorageService,
    private restaurantService: RestaurantService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.recipeForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      ingredients: ['', Validators.required],
      steps: ['', Validators.required],
      image: [null]
    });

    this.restaurantForm = this.formBuilder.group({
      name: ['', Validators.required],
      locationUrl: ['', Validators.required]
    });

    this.token = this.localStorageService.getItem('token');
  }

  ngOnInit(): void {
    this.loadUserRecipes();
    this.loadUserRestaurants();
  }

  loadUserRecipes(): void {
    this.recipeService.getRecipesByUser().subscribe(
      recipes => {
        this.recipes = recipes.map((recipe: { likes: string | any[]; comments: any; }) => {
          return {
            ...recipe,
            likesCount: recipe.likes.length,
            comments: recipe.comments
          };
        });
        this.filteredRecipes = this.recipes; // Inicialmente, todas las recetas están en la lista filtrada
      },
      error => console.error(error)
    );
  }

  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredRecipes = this.recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchTerm)
    );
  }

  createRecipe(): void {
    const formData = new FormData();
    Object.keys(this.recipeForm.controls).forEach(key => {
      const control = this.recipeForm.get(key);
      if (control) {
        formData.append(key, control.value);
      }
    });

    if (this.token) {
      this.recipeService.createRecipe(formData, this.token).subscribe(
        recipe => {
          this.recipes.push(recipe);
          this.recipeForm.reset();
          this.isCreating = false;
        },
        error => console.error(error)
      );
    }
  }

  editRecipe(recipe: any): void {
    this.recipeForm.patchValue({
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients.join(', '),
      steps: recipe.steps
    });
    this.isEditing = true;
    this.isCreating = false;
    this.currentRecipeId = recipe._id;
  }

  updateRecipe(): void {
    if (!this.currentRecipeId) return;

    const formData = new FormData();
    Object.keys(this.recipeForm.controls).forEach(key => {
      const control = this.recipeForm.get(key);
      if (control) {
        formData.append(key, control.value);
      }
    });

    if (this.token) {
      this.recipeService.updateRecipe(this.currentRecipeId, formData, this.token).subscribe(
        updatedRecipe => {
          const index = this.recipes.findIndex(recipe => recipe._id === this.currentRecipeId);
          if (index !== -1) {
            this.recipes[index] = updatedRecipe;
          }
          this.isEditing = false;
          this.currentRecipeId = null;
          this.recipeForm.reset();
        },
        error => console.error(error)
      );
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.currentRecipeId = null;
    this.recipeForm.reset();
  }

  startCreating(): void {
    this.isCreating = true;
    this.isEditing = false;
    this.recipeForm.reset();
  }

  cancelCreate(): void {
    this.isCreating = false;
    this.recipeForm.reset();
  }

  deleteRecipe(id: string): void {
    if (this.token) {
      this.recipeService.deleteRecipe(id, this.token).subscribe(
        () => this.recipes = this.recipes.filter(recipe => recipe._id !== id),
        error => console.error(error)
      );
    }
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.recipeForm.patchValue({
        image: file
      });
    }
  }
  loadUserRestaurants(): void {
    if (this.token) {
      this.restaurantService.getRestaurantsByUser(this.token).subscribe(
        restaurants => {
          this.restaurants = restaurants;
        },
        error => console.error(error)
      );
    }
  }

  createRestaurant(): void {
    if (!this.token) return;

    const formData = this.restaurantForm.value;

    this.restaurantService.createRestaurant(formData, this.token).subscribe(
      restaurant => {
        this.restaurants.push(restaurant);
        this.restaurantForm.reset();
        this.isCreatingRestaurant = false;
      },
      error => console.error(error)
    );
  }

  editRestaurant(restaurant: any): void {
    this.restaurantForm.patchValue({
      name: restaurant.name,
      locationUrl: restaurant.locationUrl
    });
    this.isEditingRestaurant = true;
    this.isCreatingRestaurant = false;
    this.currentRestaurantId = restaurant._id;
  }

  updateRestaurant(): void {
    if (!this.token || !this.currentRestaurantId) return;

    const formData = this.restaurantForm.value;

    this.restaurantService.updateRestaurant(this.currentRestaurantId, formData, this.token).subscribe(
      updatedRestaurant => {
        const index = this.restaurants.findIndex(r => r._id === this.currentRestaurantId);
        if (index !== -1) {
          this.restaurants[index] = updatedRestaurant;
        }
        this.restaurantForm.reset();
        this.isEditingRestaurant = false;
        this.currentRestaurantId = null;
      },
      error => console.error(error)
    );
  }

  deleteRestaurant(id: string): void {
    if (!this.token) return;

    this.restaurantService.deleteRestaurant(id, this.token).subscribe(
      () => {
        this.restaurants = this.restaurants.filter(r => r._id !== id);
      },
      error => console.error(error)
    );
  }

  startCreatingRestaurant(): void {
    this.isCreatingRestaurant = true;
    this.isEditingRestaurant = false;
    this.restaurantForm.reset();
  }

  cancelCreateRestaurant(): void {
    this.isCreatingRestaurant = false;
    this.restaurantForm.reset();
  }

  cancelEditRestaurant(): void {
    this.isEditingRestaurant = false;
    this.currentRestaurantId = null;
    this.restaurantForm.reset();
  }
// En tu componente
restaurantCountText(): string {
  if (this.restaurants.length === 0) {
    return 'Mi Sucursal';
  } else if (this.restaurants.length === 1) {
    return 'Mi Sucursal';
  } else {
    return 'Mis Sucursales';
  }
}


  viewRecipe(recipeId: string): void {
    this.router.navigate(['/recipe', recipeId]);
  }

  // logout(): void {
  //   this.localStorageService.removeItem('token');
  //   this.router.navigate(['/login']);
  // }
}
