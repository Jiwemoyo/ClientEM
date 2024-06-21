// user-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../../services/recipe.service';
import { CommentService } from '../../services/comment.service';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent implements OnInit {
  recipes: any[] = [];

  constructor(
    private recipeService: RecipeService,
    private commentService: CommentService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.recipeService.getRecipesByUser().subscribe(
      recipes => {
        this.recipes = recipes;
        this.loadCommentsForRecipes();
      },
      error => console.error(error)
    );
  }

  private loadCommentsForRecipes(): void {
    this.recipes.forEach(recipe => {
      this.commentService.getCommentsByRecipe(recipe._id).subscribe(
        comments => {
          recipe.comments = comments;
        },
        error => console.error(error)
      );
    });
  }
}
