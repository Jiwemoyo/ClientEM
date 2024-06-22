// user-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../../services/recipe.service';
import { CommentService } from '../../services/comment.service';
import { LikeService } from '../../services/like.service';
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
    private likeService: LikeService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
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
}
