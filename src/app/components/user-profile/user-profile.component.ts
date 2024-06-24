import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  recipes: any[] = [];
  recipeForm: FormGroup;
  token: string | null;
  isEditing: boolean = false;
  isCreating: boolean = false;
  currentRecipeId: string | null = null;

  constructor(
    private recipeService: RecipeService,
    private localStorageService: LocalStorageService,
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

    this.token = this.localStorageService.getItem('token');
  }

  ngOnInit(): void {
    this.loadUserRecipes();
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
      },
      error => console.error(error)
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

  logout(): void {
    this.localStorageService.removeItem('token');
    this.router.navigate(['/login']);
  }
}
