import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from './material/material.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainNavComponent } from './main-nav/main-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { PageHomeComponent } from './page-home/page-home.component';
import { PagePasswordsComponent } from './page-passwords/page-passwords.component';
import { PageTagsComponent } from './page-tags/page-tags.component';
import { PageSettingsComponent } from './page-settings/page-settings.component';
import { AboutDialogComponent } from './about-dialog/about-dialog.component';
import { PageLoginComponent } from './page-login/page-login.component';
import { PageRegisterComponent } from './page-register/page-register.component';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent,
    MainNavComponent,
    PageHomeComponent,
    PagePasswordsComponent,
    PageTagsComponent,
    PageSettingsComponent,
    AboutDialogComponent,
    PageLoginComponent,
    PageRegisterComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    LayoutModule,
  ],
  providers: [],
  entryComponents:[AboutDialogComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
