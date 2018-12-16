import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { MatSnackBar } from '@angular/material';
import { UserService } from '../user.service';

@Component({
  selector: 'app-page-login',
  templateUrl: './page-login.component.html',
  styleUrls: ['./page-login.component.scss']
})
export class PageLoginComponent {

  username: string = '';
  password: string = '';

  logging_in: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute, private api: ApiService, public snackBar: MatSnackBar, private user: UserService) { }

  login() {
    if(this.logging_in)
      return;

    this.logging_in = true;

    this.api.login(this.username, this.password).subscribe(
      result => {
        this.logging_in = false;
        this.user.setToken(result['token']);
        this.route.queryParams.subscribe(params => {
          let redirect_url = '/home';

          if (params.redirectUrl){
            redirect_url = params.redirectUrl;
          }

          this.router.navigateByUrl(redirect_url);
        });
      },
      result => {
        this.logging_in = false;
        this.snackBar.open(result.error.error, "OK", {
          duration: 5000,
          panelClass: 'snackbar_error'
        });
        console.error(result);
      }
    );
  }
}
