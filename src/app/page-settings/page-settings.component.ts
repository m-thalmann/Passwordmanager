import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Md5Pipe } from '../md5.pipe';
import { ApiService } from '../api.service';
import { SyncModeService } from '../sync-mode.service';
import { PasswordsService } from '../passwords.service';
import { ConfirmOverlayComponent } from '../confirm-overlay/confirm-overlay.component';

@Component({
  selector: 'app-page-settings',
  templateUrl: './page-settings.component.html',
  styleUrls: ['./page-settings.component.scss']
})
export class PageSettingsComponent {

  password: string = '';
  new_pin: string = '';
  new_email: string = '';
  new_password: string = '';
  new_password_retype: string = '';

  settings_changing: boolean = false;
  sessions_loading: boolean = true;
  synchronizing: boolean = false;

  sessions = this.api.getLogins().finally(() => {
    this.sessions_loading = false;
  });

  constructor(public user: UserService, private api: ApiService, public snackBar: MatSnackBar,
    private syncMode: SyncModeService, private passwords: PasswordsService, private dialog: MatDialog) { }

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
    this.password = this.new_pin = '';
  }

  async change_settings(){
    this.dialog.open(ConfirmOverlayComponent, {
      data: { title: 'Warning', message: 'By changing your credentials, you will be logged out from all devices and all locally saved data will be cleared!' +
        ' Do you really want to change them?', critical: true }
    }).afterClosed().subscribe(async ret => {
      if (ret === true) {
        if(this.checkPW()){
          try{
            this.settings_changing = true;
    
            let data = {};
    
            if(this.new_email != ''){
              data['email'] = this.new_email;
            }
    
            if(this.new_password != '' && this.new_password_retype != ''){
              if(this.new_password == this.new_password_retype){
                data['password'] = this.new_password;
              }else{
                this.snackBar.open('Passwords do not match', "OK", {
                  duration: 5000,
                  panelClass: 'snackbar_error'
                });
                return;
              }
            }
    
            await this.passwords.change_user_settings(data);
          }catch(e){
            this.snackBar.open(e.error.error, "OK", {
              duration: 5000,
              panelClass: 'snackbar_error'
            });
          }
          
          this.password = this.new_email = this.new_password = this.new_password_retype = '';
          
          await this.api.checkAuth();
          this.settings_changing = false;
        }
      }
    })
  }

  async removeLogin(id: number){
    this.settings_changing = true;

    try{
      await this.api.logoutId(id);
    }catch(e){
      this.snackBar.open(e.error.error, "OK", {
        duration: 5000,
        panelClass: 'snackbar_error'
      });
    }finally{
      await this.api.checkAuth();

      this.reloadLogins();
      this.settings_changing = false;
    }
  }

  async removeAllLogins(){
    await this.api.logoutAll();
    await this.api.checkAuth();
  }

  reloadLogins(){
    this.sessions_loading = true;
    this.sessions = this.api.getLogins().finally(() => {
      this.sessions_loading = false;
    });
  }

  set sync_mode(mode: string){
    this.syncMode.mode = mode;
  }

  get sync_mode(){
    return this.syncMode.mode;
  }

  async sync(){
    this.settings_changing = true;
    this.synchronizing = true;
    await this.passwords.sync();
    this.settings_changing = false;
    this.synchronizing = false;
  }
  
  deleteData(){
    this.dialog.open(ConfirmOverlayComponent, {
      data: { title: 'Warning', message: 'Do you really want to delete all of your saved passwords? This can not be undone!', critical: true }
    }).afterClosed().subscribe(async ret => {
      if (ret === true) {
        this.settings_changing = true;
        await this.passwords.removeAll();
        this.settings_changing = false;
      }
    })
  }
}
