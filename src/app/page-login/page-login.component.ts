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

  pin: string = '';

  logging_in: boolean = false;

  pin_login: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute, private api: ApiService, public snackBar: MatSnackBar, private user: UserService) { 
    if(user.isLoggedin()){
      this.route.queryParams.subscribe(params => {
        let redirect_url = '/home';

        if (params.redirectUrl) {
          redirect_url = params.redirectUrl;
        }

        this.router.navigateByUrl(redirect_url);
      });
    }

    this.pin_login = user.isKnown() && user.hasPIN();
  }

  login() {
    if(this.logging_in)
      return;

    this.logging_in = true;

    this.api.login(this.username, this.password).subscribe(
      result => {
        this.logging_in = false;
        this.user.login({
          user: result.user,
          token: result.token,
          password: this.password
        });

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

  login_pin(){
    if(!this.pin_login)
      return;

    this.logging_in = true;

    try{
      let ret = this.user.unlock(parseInt(this.pin));
      if(ret == UserService.unlock_return.CORRECT){
        this.route.queryParams.subscribe(params => {
          let redirect_url = '/home';

          if (params.redirectUrl) {
            redirect_url = params.redirectUrl;
          }

          this.router.navigateByUrl(redirect_url);
        });
      }else if(ret == UserService.unlock_return.WRONG){
        this.snackBar.open("Wrong PIN", "OK", {
          duration: 5000,
          panelClass: 'snackbar_error'
        });
      }else if(ret == UserService.unlock_return.MAX_TRIES){
        this.snackBar.open("Too many tries", "OK", {
          duration: 5000,
          panelClass: 'snackbar_error'
        });
      }else if(ret == UserService.unlock_return.ERROR){
        this.snackBar.open("Error", "OK", {
          duration: 5000,
          panelClass: 'snackbar_error'
        });
      }
    }catch(e){
      this.snackBar.open("PIN only has numbers", "OK", {
        duration: 5000,
        panelClass: 'snackbar_error'
      });
    }

    this.logging_in = false;
  }

  logout(){
    this.user.logout();
  }
}
