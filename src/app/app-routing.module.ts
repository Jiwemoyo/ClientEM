import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';

import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { RecipeDetailComponent } from './components/recipe-detail/recipe-detail.component';
import { RecipeFormComponent } from './components/recipe-form/recipe-form.component';
import { CommentListComponent } from './components/comment-list/comment-list.component';
import { CommentFormComponent } from './components/comment-form/comment-form.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { UserProfileViewComponent } from './components/user-profile-view/user-profile-view.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { LoadingGuard } from './guards/loading.guard';

const routes: Routes = [
  { path: 'register', component: RegisterComponent,canActivate:[AuthenticatedGuard,LoadingGuard] },
  { path: 'login', component: LoginComponent,canActivate:[AuthenticatedGuard,LoadingGuard]},
  { path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard,LoadingGuard] },
  { path: 'admin/users', component: UserListComponent },
  { path: 'recipes', component: RecipeListComponent, canActivate:[LoadingGuard] },
  { path: 'recipe/:id', component: RecipeDetailComponent, canActivate: [AuthGuard] },
  { path: 'create-recipe', component: RecipeFormComponent,canActivate:[LoadingGuard] },
  { path: 'comments/:recipeId', component: CommentListComponent },
  { path: 'user-profile-view/:userId', component: UserProfileViewComponent, canActivate: [AuthGuard,LoadingGuard] },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'create-comment', component: CommentFormComponent },
  { path: 'admin/users', component: UserListComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'user-list', component: UserListComponent },
  { path: '', redirectTo: '/recipes', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
