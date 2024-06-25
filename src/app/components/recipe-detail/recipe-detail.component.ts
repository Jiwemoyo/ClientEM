import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { CommentService } from '../../services/comment.service';
import { LikeService } from '../../services/like.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from '../../services/local-storage.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {
  recipe: any = {}; // Inicializar recipe como un objeto vacío
  commentForm: FormGroup;
  editCommentForm: FormGroup;
  editingCommentId: string | null = null;
  userId: string | null = null;
  userHasLiked: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private commentService: CommentService,
    private likeService: LikeService,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService
  ) {
    this.commentForm = this.fb.group({
      content: ['', Validators.required]
    });

    this.editCommentForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const token = this.localStorageService.getItem('token');

    if (token) {
      const decodedToken: any = jwtDecode(token);
      this.userId = decodedToken.userId;
    }

    if (id && token) {
      this.recipeService.getRecipeById(id, token).subscribe((data: any) => {
        this.recipe = data;
        this.checkUserLike();
      });
    }
  }

  checkUserLike(): void {
    if (this.recipe.likes && this.recipe.likes.some((like: any) => like.user === this.userId)) {
      this.userHasLiked = true;
    } else {
      this.userHasLiked = false;
    }
  }

  likeRecipe(): void {
    const token = this.localStorageService.getItem('token');
    if (token) {
      this.likeService.likeRecipe(this.recipe._id, token).subscribe(() => {
        this.userHasLiked = true;
        if (this.recipe.likesCount !== undefined && this.recipe.likesCount !== null) {
          this.recipe.likesCount += 1; // Incrementar el contador de likes
        } else {
          this.recipe.likesCount = 1; // Inicializar el contador de likes si es undefined o null
        }
      });
    }
  }

  unlikeRecipe(): void {
    const token = this.localStorageService.getItem('token');
    if (token) {
      this.likeService.unlikeRecipe(this.recipe._id, token).subscribe(() => {
        this.userHasLiked = false;
        if (this.recipe.likesCount !== undefined && this.recipe.likesCount !== null) {
          this.recipe.likesCount -= 1; // Decrementar el contador de likes
        } else {
          this.recipe.likesCount = 0; // Inicializar el contador de likes si es undefined o null
        }
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
          location.reload();
        },
        (error) => {
          console.error('Error creating comment:', error);
        }
      );
    }
  }

  onEditComment(commentId: string, currentContent: string): void {
    this.editingCommentId = commentId;
    this.editCommentForm.patchValue({ content: currentContent });
  }

  onSubmitEditComment(): void {
    if (this.editCommentForm.valid && this.editingCommentId) {
      const token = this.localStorageService.getItem('token');
      const commentData = {
        content: this.editCommentForm.get('content')?.value
      };

      this.commentService.updateComment(this.editingCommentId, commentData, token!).subscribe(
        () => {
          location.reload();
        },
        (error) => {
          console.error('Error updating comment:', error);
        }
      );
    }
  }

  onDeleteComment(commentId: string): void {
    const token = this.localStorageService.getItem('token');
    this.commentService.deleteComment(commentId, token!).subscribe(
      () => {
        location.reload();
      },
      (error) => {
        console.error('Error deleting comment:', error);
      }
    );
  }

  onCancelEdit(): void {
    this.editingCommentId = null;
    this.editCommentForm.reset();
  }
}
