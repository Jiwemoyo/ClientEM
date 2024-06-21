import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { RecipeDetailComponent } from './components/recipe-detail/recipe-detail.component';
import { RecipeFormComponent } from './components/recipe-form/recipe-form.component';
import { CommentListComponent } from './components/comment-list/comment-list.component';
import { CommentFormComponent } from './components/comment-form/comment-form.component';

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin/users', component: UserListComponent },
  { path: 'recipes', component: RecipeListComponent },
  { path: 'recipes/:id', component: RecipeDetailComponent },
  { path: 'create-recipe', component: RecipeFormComponent },
  { path: 'comments/:recipeId', component: CommentListComponent },
  { path: 'create-comment', component: CommentFormComponent },
  { path: '', redirectTo: '/recipes', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
