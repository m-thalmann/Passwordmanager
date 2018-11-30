import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageHomeComponent } from './page-home/page-home.component';
import { PagePasswordsComponent } from './page-passwords/page-passwords.component';
import { PageTagsComponent } from './page-tags/page-tags.component';
import { PageSettingsComponent } from './page-settings/page-settings.component';

const routes: Routes = [
  { path: '', component: PageHomeComponent },
  { path: 'passwords', component: PagePasswordsComponent },
  { path: 'tags', component: PageTagsComponent },
  { path: 'settings', component: PageSettingsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
