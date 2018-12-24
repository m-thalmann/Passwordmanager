import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { MatSnackBar } from '@angular/material';
import { UserService } from '../user.service';

import { Config } from '../../config/config';

enum LoginType{
  default,
  pin,
  password
}

@Component({
  selector: 'app-page-login',
  templateUrl: './page-login.component.html',
  styleUrls: ['./page-login.component.scss']
})
export class PageLoginComponent {
  Config: Config = Config;

  remember: boolean = false;

  username: string = '';
  password: string = '';

  pin: string = '';

  logging_in: boolean = false;

  login_type: LoginType = LoginType.default;

  LoginType = LoginType;

  registration_enabled: boolean = false;

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

    if(user.isKnown() && user.hasPIN()){
      this.login_type = LoginType.pin;
    }else if(user.isKnown() && user.hasTest()){
      this.login_type = LoginType.password;
    }

    if(Config.registration_enabled){
      this.api.registrationEnabled().subscribe(
        result => {
          this.registration_enabled = result.value;
        }
      );
    }
  }

  login(){
    switch(this.login_type){
      case LoginType.pin: {
        this.login_pin();
        break;
      }
      case LoginType.password: {
        this.login_password();
        break;
      }
      default: {
        this.login_default();
        break;
      }
    }
  }

  login_default() {
    if(this.logging_in || this.login_type != LoginType.default)
      return;

    this.logging_in = true;

    this.api.login(this.username, this.password).subscribe(
      result => {
        this.logging_in = false;
        this.user.login(result.user, result.token, this.password, this.remember);

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
        this.password = this.username = this.pin = '';
      }
    );
  }

  login_password(){
    if(this.logging_in || this.login_type != LoginType.password)
      return;

      this.logging_in = true;

      let ret = this.user.unlock(this.password);
      if(ret == UserService.unlock_return.CORRECT){
        this.route.queryParams.subscribe(params => {
          let redirect_url = '/home';

          if (params.redirectUrl) {
            redirect_url = params.redirectUrl;
          }

          this.router.navigateByUrl(redirect_url);
        });
      }else if(ret == UserService.unlock_return.WRONG){
        this.snackBar.open("Wrong Password", "OK", {
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

      this.password = this.username = this.pin = '';
  
      this.logging_in = false;
  }

  login_pin(){
    if(this.logging_in || this.login_type != LoginType.pin)
      return;

    this.logging_in = true;

    try{
      let ret = this.user.unlock_pin(parseInt(this.pin));
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
    
    this.password = this.username = this.pin = '';
    this.logging_in = false;
  }

  async logout() {
    this.snackBar.open("Logging out...", "OK", {
      duration: 5000,
    });

    await this.api.logout();
    this.user.logout();
  }
}