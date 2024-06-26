// user-profile-view.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-user-profile-view',
  templateUrl: './user-profile-view.component.html',
  styleUrls: ['./user-profile-view.component.css']
})
export class UserProfileViewComponent implements OnInit {
  recipes: any[] = [];
  username: string = '';

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService
  ) { }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (userId) {
      this.recipeService.getRecipesByUserId(userId).subscribe((data: any) => {
        this.recipes = data;
        if (this.recipes.length > 0) {
          this.username = this.recipes[0].author.username;
        }
      });
    }
  }
}
