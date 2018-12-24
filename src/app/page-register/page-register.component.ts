import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

import { Config } from '../../config/config';

@Component({
  selector: 'app-page-register',
  templateUrl: './page-register.component.html',
  styleUrls: ['./page-register.component.scss']
})
export class PageRegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';

  registering: boolean = false;

  constructor(private api: ApiService, private snackBar: MatSnackBar, private router: Router) {
    if(!Config.registration_enabled){
      this.router.navigateByUrl('/login');
    }
  }

  register(){
    if(this.registering)
      return;

    this.registering = true;

    this.api.register(this.username, this.email, this.password).subscribe(
      result => {
        this.registering = false;
        this.snackBar.open(result.info, "OK", {
          duration: 5000,
        });
        this.router.navigateByUrl('/login');
      },
      result => {
        this.registering = false;
        this.snackBar.open(result.error.error, "OK", {
          duration: 5000,
          panelClass: 'snackbar_error'
        });
        console.error(result);
        this.password = this.email = this.username = '';
      }
    );
  }
}
