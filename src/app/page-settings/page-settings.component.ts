import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { MatSnackBar } from '@angular/material';
import { Md5Pipe } from '../md5.pipe';

@Component({
  selector: 'app-page-settings',
  templateUrl: './page-settings.component.html',
  styleUrls: ['./page-settings.component.scss']
})
export class PageSettingsComponent {

  password: string = '';
  new_pin: string = '';

  constructor(private user: UserService, public snackBar: MatSnackBar) { }

  checkPW(){
    let pw = new Md5Pipe().transform(this.password);

    return pw == this.user.password;
  }

  remove_pin(){
    if (this.checkPW()){
      this.user.removePIN();
    }else{
      this.snackBar.open("Password wrong", "OK", {
        duration: 5000,
        panelClass: 'snackbar_error'
      });
    }
    this.password = this.new_pin = "";
  }
  
  change_pin(){
    if (this.checkPW()) {
      try{
        this.user.setPIN(parseInt(this.new_pin));
      }catch(e){
        this.snackBar.open("PIN only has numbers", "OK", {
          duration: 5000,
          panelClass: 'snackbar_error'
        });
      }
    } else {
      this.snackBar.open("Password wrong", "OK", {
        duration: 5000,
        panelClass: 'snackbar_error'
      });
    }
    this.password = this.new_pin = "";
  }
}
