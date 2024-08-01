import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { CommentService } from '../../services/comment.service';
import { LikeService } from '../../services/like.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from '../../services/local-storage.service';
import { jwtDecode } from 'jwt-decode';
import { LoadingService } from '../../services/loading.service';
import { AuthService } from '../../services/auth.service';

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
  likesCount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private commentService: CommentService,
    private likeService: LikeService,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private loadingService: LoadingService,
    private authService: AuthService
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
      this.loadingService.show(); // Muestra el indicador de carga
      this.recipeService.getRecipeById(id, token).subscribe((data: any) => {
        this.recipe = data;
        if (typeof this.recipe.ingredients === 'string') {
          this.recipe.ingredients = this.recipe.ingredients.split(',');
        }
        this.getLikes();
        this.checkUserLike();
        this.getLikesCount();
        this.loadingService.hide(); // Oculta el indicador de carga
      }, error => {
        console.error('Error al cargar receta:', error);
        this.loadingService.hide(); // Oculta el indicador de carga en caso de error
      });
    }
  }
  toggleLike() {
    if (this.userHasLiked) {
      this.unlikeRecipe();
    } else {
      this.likeRecipe();
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
        this.recipe.likesCount += 1;
        this.getLikes();
        this.getLikesCount();
      });
    }
  }

  unlikeRecipe(): void {
    const token = this.localStorageService.getItem('token');
    if (token) {
      this.likeService.unlikeRecipe(this.recipe._id, token).subscribe(() => {
        this.userHasLiked = false;
        this.recipe.likesCount -= 1;
        this.getLikes();
        this.getLikesCount();
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
        (newComment: any) => {
          // Obtén el nombre de usuario de varias fuentes posibles
          const username = this.authService.getUsername() ||
                           this.localStorageService.getItem('username') ||
                           'Usuario Anónimo';

          console.log('Username:', username); // Para depuración

          const fullNewComment = {
            _id: newComment._id,
            content: newComment.content,
            author: {
              _id: this.userId,
              username: username
            },
            createdAt: newComment.createdAt || new Date().toISOString(),
            recipe: newComment.recipe
          };

          console.log('Full New Comment:', fullNewComment); // Para depuración

          this.recipe.comments = [fullNewComment, ...this.recipe.comments];
          this.commentForm.reset();
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
        (updatedComment: any) => {
          const index = this.recipe.comments.findIndex((c: any) => c._id === this.editingCommentId);
          if (index !== -1) {
            // Mantener toda la información del comentario, solo actualizar el contenido
            this.recipe.comments[index].content = updatedComment.content;
            this.recipe.comments = [...this.recipe.comments];
          }
          this.editingCommentId = null;
          this.editCommentForm.reset();
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
        this.recipe.comments = this.recipe.comments.filter((c: any) => c._id !== commentId);
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
