import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { CommentService } from '../../services/comment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {
  recipe: any;
  commentForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private commentService: CommentService,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService
  ) {
    this.commentForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.recipeService.getRecipeById(id, this.localStorageService.getItem('token')!).subscribe((data: any) => {
        this.recipe = data;
      });
    }
  }

  onSubmitComment(): void {
    if (this.commentForm.valid) {
      const token = this.localStorageService.getItem('token');
      const commentData = {
        content: this.commentForm.get('content')?.value,
        recipeId: this.recipe._id
      };

      this.commentService.createComment(commentData, token!).subscribe(
        (newComment) => {
          // Instead of manually updating the comments array, we refresh the page
          location.reload();
        },
        (error) => {
          console.error('Error creating comment:', error);
        }
      );
    }
  }
}
