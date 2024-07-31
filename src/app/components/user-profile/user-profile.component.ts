import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { RestaurantService } from '../../services/restaurant.service';

const forbiddenWords = ['puta', 'zorra', 'putas','zorras','verga','vergas'];

function isTextAppropriate(text: string): boolean {
  const regex = new RegExp(forbiddenWords.join('|'), 'i');
  return !regex.test(text);
}

const fieldTranslations: { [key: string]: string } = {
  title: 'título',
  description: 'descripción',
  ingredients: 'ingredientes',
  steps: 'pasos',
  image: 'imagen',
};

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
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
  archivoSeleccionado: File | null = null;
  existingImageUrl: string | null = null;
  fieldError: string | null = null;

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
      image: [null, this.isCreating ? Validators.required : Validators.nullValidator], // Validación condicional
    });

    this.restaurantForm = this.formBuilder.group({
      name: ['', Validators.required],
      locationUrl: ['', [Validators.required, this.googleMapsUrlValidator]],
    });

    this.token = this.localStorageService.getItem('token');
  }

  googleMapsUrlValidator(control: { value: string }) {
    const url = control.value;
    const validPatterns = [
      /^https:\/\/(www\.)?google\.com\/maps\//,
      /^https:\/\/goo\.gl\/maps\//,
      /^https:\/\/maps\.app\.goo\.gl\//,
    ];

    const isValid = validPatterns.some((pattern) => pattern.test(url));
    return isValid ? null : { invalidGoogleMapsUrl: true };
  }

  ngOnInit(): void {
    this.loadUserRecipes();
    this.loadUserRestaurants();
  }

  loadUserRecipes(): void {
    this.recipeService.getRecipesByUser().subscribe(
      (recipes) => {
        this.recipes = recipes.map(
          (recipe: { likes: string | any[]; comments: any }) => ({
            ...recipe,
            likesCount: recipe.likes.length,
            comments: recipe.comments,
          })
        );
        this.filteredRecipes = this.recipes;
      },
      (error) => console.error(error)
    );
  }

  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredRecipes = this.recipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(searchTerm)
    );
  }

  validateRecipeForm(): boolean {
    const fieldsToValidate = [
      'title',
      'description',
      'ingredients',
      'steps',
      'image',
    ];
    for (const field of fieldsToValidate) {
      const control = this.recipeForm.get(field);
      if (!control || !control.value) {
        this.fieldError = `El campo ${
          fieldTranslations[field] || field
        } no puede estar vacío.`;
        return false;
      }
      if (field !== 'image' && !isTextAppropriate(control.value)) {
        this.fieldError = `El campo ${
          fieldTranslations[field] || field
        } contiene palabras inapropiadas. Por favor, elija otro contenido.`;
        return false;
      }
    }
    return true;
  }

  createRecipe(): void {
    if (this.recipeForm.invalid) {
      this.markAllFieldsAsTouched();
      this.fieldError = "Por favor, completa todos los campos requeridos, incluyendo la imagen.";
      return;
    }

    if (!this.validateRecipeForm()) {
      return;
    }

    this.fieldError = null; // Limpiar el mensaje de error si el contenido es apropiado

    const formData = new FormData();
    Object.keys(this.recipeForm.controls).forEach((key) => {
      const control = this.recipeForm.get(key);
      if (control && control.value !== null && key !== 'image') {
        formData.append(key, control.value);
      }
    });

    if (this.archivoSeleccionado) {
      formData.append(
        'image',
        this.archivoSeleccionado,
        this.archivoSeleccionado.name
      );
    }

    if (this.token) {
      this.recipeService.createRecipe(formData, this.token).subscribe(
        (recipe) => {
          this.recipes.push(recipe);
          this.recipeForm.reset();
          this.isCreating = false;
          this.archivoSeleccionado = null;
          this.loadUserRecipes();
        },
        (error) => {
          console.error(error);
          this.fieldError =
            'Hubo un error al crear la receta. Por favor, intenta de nuevo.';
        }
      );
    }
  }

  markAllFieldsAsTouched(): void {
    Object.keys(this.recipeForm.controls).forEach((field) => {
      const control = this.recipeForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  editRecipe(recipe: any): void {
    this.recipeForm.patchValue({
      title: recipe.title,
      description: recipe.description,
      ingredients: Array.isArray(recipe.ingredients)
        ? recipe.ingredients.join(', ')
        : recipe.ingredients,
      steps: Array.isArray(recipe.steps)
        ? recipe.steps.join('\n')
        : recipe.steps,
    });

    this.existingImageUrl = recipe.image;
    this.archivoSeleccionado = null;
    this.isEditing = true;
    this.isCreating = false;
    this.currentRecipeId = recipe._id;
  }

  updateRecipe(): void {
    if (!this.currentRecipeId) return; // Asegúrate de que `currentRecipeId` esté disponible

    if (this.recipeForm.invalid) {
      this.markAllFieldsAsTouched(); // Marca todos los campos como tocados para mostrar errores
      this.fieldError = "Por favor, completa todos los campos requeridos."; // Mensaje de error
      return;
    }

    if (!this.validateRecipeForm()) {
      // Aquí deberías manejar la validación específica si es necesaria
      return;
    }

    this.fieldError = null; // Limpiar el mensaje de error si el contenido es apropiado

    const formData = new FormData();
    Object.keys(this.recipeForm.controls).forEach((key) => {
      const control = this.recipeForm.get(key);
      if (control && control.value !== null && key !== 'image') {
        formData.append(key, control.value); // Agrega campos del formulario a FormData
      }
    });

    if (this.archivoSeleccionado) {
      formData.append(
        'image',
        this.archivoSeleccionado,
        this.archivoSeleccionado.name // Agrega el archivo seleccionado al FormData
      );
    }

    if (this.token) {
      this.recipeService
        .updateRecipe(this.currentRecipeId, formData, this.token)
        .subscribe(
          (updatedRecipe) => {
            const index = this.recipes.findIndex(
              (recipe) => recipe._id === this.currentRecipeId
            );
            if (index !== -1) {
              this.recipes[index] = updatedRecipe; // Actualiza la receta en la lista local
            }
            this.isEditing = false;
            this.currentRecipeId = null;
            this.recipeForm.reset(); // Reinicia el formulario
            this.archivoSeleccionado = null; // Limpia el archivo seleccionado
            this.loadUserRecipes(); // Carga las recetas del usuario
          },
          (error) => {
            console.error(error);
            this.fieldError = "Hubo un error al actualizar la receta. Por favor, inténtalo de nuevo."; // Mensaje de error al usuario
          }
        );
    }
  }


  cancelEdit(): void {
    this.isEditing = false;
    this.currentRecipeId = null;
    this.recipeForm.reset();
    this.archivoSeleccionado = null;
    this.fieldError = null; // Limpiar el mensaje de error al cancelar
  }

  startCreating(): void {
    this.isCreating = true;
    this.isEditing = false;
    this.recipeForm.reset();
    this.archivoSeleccionado = null;
  }

  cancelCreate(): void {
    this.isCreating = false;
    this.recipeForm.reset();
    this.archivoSeleccionado = null;
    this.fieldError = null; // Limpiar el mensaje de error al cancelar
  }

  deleteRecipe(id: string): void {
    if (this.token) {
      this.recipeService.deleteRecipe(id, this.token).subscribe(
        () => {
          this.recipes = this.recipes.filter((recipe) => recipe._id !== id);
          this.loadUserRecipes();
        },
        (error) => console.error(error)
      );
    }
  }

  alSeleccionarArchivo(evento: any): void {
    const archivo = evento.target.files[0];
    if (archivo) {
      console.log('Archivo seleccionado:', archivo);
      if (archivo.type.match(/image\/(jpeg|png|jpg)/)) {
        this.archivoSeleccionado = archivo;
        this.recipeForm.patchValue({
          image: archivo,
        });
        this.recipeForm.get('image')?.updateValueAndValidity();
      } else {
        console.log('Archivo no válido');
        alert(
          'Por favor, selecciona un archivo de imagen válido (JPEG, PNG, JPG).'
        );
        evento.target.value = ''; // Limpia el input
        this.recipeForm.patchValue({
          image: null,
        });
        this.recipeForm.get('image')?.updateValueAndValidity();
      }
    }
  }

  loadUserRestaurants(): void {
    if (this.token) {
      this.restaurantService.getRestaurantsByUser(this.token).subscribe(
        (restaurants) => {
          this.restaurants = restaurants;
        },
        (error) => console.error(error)
      );
    }
  }

  createRestaurant(): void {
    if (!this.token || !this.restaurantForm.valid) return;

    const formData = this.restaurantForm.value;

    this.restaurantService.createRestaurant(formData, this.token).subscribe(
      (restaurant) => {
        this.restaurants.push(restaurant);
        this.restaurantForm.reset();
        this.isCreatingRestaurant = false;
        this.loadUserRestaurants();
      },
      (error) => console.error(error)
    );
  }

  editRestaurant(restaurant: any): void {
    this.restaurantForm.patchValue({
      name: restaurant.name,
      locationUrl: restaurant.locationUrl,
    });
    this.isEditingRestaurant = true;
    this.isCreatingRestaurant = false;
    this.currentRestaurantId = restaurant._id;
  }

  updateRestaurant(): void {
    if (!this.token || !this.currentRestaurantId || !this.restaurantForm.valid)
      return;

    const formData = this.restaurantForm.value;

    this.restaurantService
      .updateRestaurant(this.currentRestaurantId, formData, this.token)
      .subscribe(
        (updatedRestaurant) => {
          const index = this.restaurants.findIndex(
            (r) => r._id === this.currentRestaurantId
          );
          if (index !== -1) {
            this.restaurants[index] = updatedRestaurant;
          }
          this.restaurantForm.reset();
          this.isEditingRestaurant = false;
          this.currentRestaurantId = null;
          this.loadUserRestaurants();
        },
        (error) => console.error(error)
      );
  }
  isValidGoogleMapsUrl(url: string): boolean {
    return this.googleMapsUrlValidator({ value: url }) === null;
  }

  deleteRestaurant(id: string): void {
    if (!this.token) return;

    this.restaurantService.deleteRestaurant(id, this.token).subscribe(
      () => {
        this.restaurants = this.restaurants.filter((r) => r._id !== id);
        this.loadUserRestaurants();
      },
      (error) => console.error(error)
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

  restaurantCountText(): string {
    return this.restaurants.length <= 1 ? 'Mi Sucursal' : 'Mis Sucursales';
  }

  viewRecipe(recipeId: string): void {
    this.router.navigate(['/recipe', recipeId]);
  }
}
