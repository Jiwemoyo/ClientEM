import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RecipeService } from '../../services/recipe.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { CommentService } from '../../services/comment.service';
import { LikeService } from '../../services/like.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent implements OnInit {
  recipes: any[] = [];
  recipeForm: FormGroup;
  token: string;

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private localStorageService: LocalStorageService,
    private commentService: CommentService,
    private likeService: LikeService
  ) {
    this.recipeForm = this.fb.group({
      title: [''],
      description: [''],
      ingredients: [''],
      steps: [''],
      image: [null]
    });

    this.token = this.localStorageService.getItem('token') ?? '';
  }

  ngOnInit(): void {
    this.loadUserRecipes();
  }

  loadUserRecipes(): void {
    this.recipeService.getRecipesByUser().subscribe(
      recipes => {
        this.recipes = recipes;
        this.loadCommentsAndLikesForRecipes();
      },
      error => console.error(error)
    );
  }

  private loadCommentsAndLikesForRecipes(): void {
    this.recipes.forEach(recipe => {
      this.commentService.getCommentsByRecipe(recipe._id).subscribe(
        comments => {
          recipe.comments = comments;
        },
        error => console.error(error)
      );

      this.likeService.getLikesCountByRecipe(recipe._id).subscribe(
        data => {
          recipe.likesCount = data.count;
        },
        error => console.error(error)
      );
    });
  }

  createRecipe(): void {
    const formData = new FormData();
    Object.keys(this.recipeForm.controls).forEach(key => {
      formData.append(key, this.recipeForm.get(key)!.value);
    });

    this.recipeService.createRecipe(formData, this.token).subscribe(
      recipe => {
        this.recipes.push(recipe);
        this.recipeForm.reset();
      },
      error => console.error(error)
    );
  }

  updateRecipe(id: string): void {
    const formData = new FormData();
    Object.keys(this.recipeForm.controls).forEach(key => {
      formData.append(key, this.recipeForm.get(key)!.value);
    });

    this.recipeService.updateRecipe(id, formData, this.token).subscribe(
      updatedRecipe => {
        const index = this.recipes.findIndex(recipe => recipe._id === id);
        if (index !== -1) {
          this.recipes[index] = updatedRecipe;
        }
      },
      error => console.error(error)
    );
  }

  deleteRecipe(id: string): void {
    this.recipeService.deleteRecipe(id, this.token).subscribe(
      () => {
        this.recipes = this.recipes.filter(recipe => recipe._id !== id);
      },
      error => console.error(error)
    );
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.recipeForm.patchValue({
        image: file
      });
    }
  }
}
