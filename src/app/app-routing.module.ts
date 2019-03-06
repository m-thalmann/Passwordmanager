import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageHomeComponent } from './page-home/page-home.component';
import { PagePasswordsComponent } from './page-passwords/page-passwords.component';
import { PageTagsComponent } from './page-tags/page-tags.component';
import { PageSettingsComponent } from './page-settings/page-settings.component';
import { PageLoginComponent } from './page-login/page-login.component';
import { PageRegisterComponent } from './page-register/page-register.component';
import { AuthGuard } from './auth.guard';
import { TagsListComponent } from './page-tags/tags-list/tags-list.component';
import { PageBookmarksComponent } from './page-bookmarks/page-bookmarks.component';

const routes: Routes = [
  { path: 'login', component: PageLoginComponent },
  { path: 'register', component: PageRegisterComponent },
  { path: 'passwords', component: PagePasswordsComponent, canActivate: [AuthGuard] },
  { path: 'tags/:name', component: TagsListComponent, canActivate: [AuthGuard] },
  { path: 'tags', component: PageTagsComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: PageSettingsComponent, canActivate: [AuthGuard] },
  { path: 'bookmarks', component: PageBookmarksComponent, canActivate: [AuthGuard] },
  { path: 'home', component: PageHomeComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
