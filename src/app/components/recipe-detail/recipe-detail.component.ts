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
  recipe: any = {};
  commentForm: FormGroup;
  editCommentForm: FormGroup;
  editingCommentId: string | null = null;
  userId: string | null = null;
  userHasLiked: boolean = false;
  likes: any[] = [];
  likesCount: number = 0; // Variable para almacenar el número de likes

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
        if (typeof this.recipe.ingredients === 'string') {
          this.recipe.ingredients = this.recipe.ingredients.split(',');
        }
        this.getLikes();
        this.checkUserLike();
        this.getLikesCount(); // Obtener el número inicial de likes
      });
    }
  }

  getLikes(): void {
    this.likeService.getLikesByRecipe(this.recipe._id).subscribe((data: any) => {
      this.likes = data;
    });
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
        this.recipe.likesCount += 1; // Incrementar el conteo localmente
        this.getLikes(); // Actualizar lista de likes después de dar like
        this.getLikesCount(); // Actualizar número de likes después de dar like
      });
    }
  }

  unlikeRecipe(): void {
    const token = this.localStorageService.getItem('token');
    if (token) {
      this.likeService.unlikeRecipe(this.recipe._id, token).subscribe(() => {
        this.userHasLiked = false;
        this.recipe.likesCount -= 1; // Decrementar el conteo localmente
        this.getLikes(); // Actualizar lista de likes después de quitar like
        this.getLikesCount(); // Actualizar número de likes después de quitar like
      });
    }
  }

  getLikesCount(): void {
    this.likeService.getLikesCountByRecipe(this.recipe._id).subscribe((data: any) => {
      this.likesCount = data.count;
    });
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
