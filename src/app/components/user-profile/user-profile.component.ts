import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../../services/recipe.service';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent implements OnInit {
  recipes: any[] = [];

  constructor(
    private recipeService: RecipeService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.recipeService.getRecipesByUser().subscribe(
      data => this.recipes = data,
      error => console.error(error)
    );
  }
}
