// src/app/components/recipe-detail/recipe-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {
  recipe: any;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const token = this.localStorageService.getItem('token');
    if (id && token) {
      this.recipeService.getRecipeById(id, token).subscribe((data: any) => {
        this.recipe = data;
      }, error => {
        console.error('Error fetching recipe details:', error);
      });
    }
  }
}
