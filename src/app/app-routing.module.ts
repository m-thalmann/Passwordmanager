import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageHomeComponent } from './page-home/page-home.component';
import { PagePasswordsComponent } from './page-passwords/page-passwords.component';
import { PageTagsComponent } from './page-tags/page-tags.component';
import { PageSettingsComponent } from './page-settings/page-settings.component';
import { PageLoginComponent } from './page-login/page-login.component';
import { PageRegisterComponent } from './page-register/page-register.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: 'login', component: PageLoginComponent },
  { path: 'register', component: PageRegisterComponent },
  { path: '', component: PageHomeComponent, canActivate: [AuthGuard] },
  { path: 'passwords', component: PagePasswordsComponent, canActivate: [AuthGuard] },
  { path: 'tags', component: PageTagsComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: PageSettingsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
