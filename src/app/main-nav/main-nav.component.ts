import { Component, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatDialog, MatSnackBar } from '@angular/material';
import { UserService } from '../user.service';
import { ApiService } from '../api.service';
import { PasswordOverlayComponent } from '../password-overlay/password-overlay.component';

@Component({
  selector: 'main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss'],
})
export class MainNavComponent {

  currentRoute: string = '/';
  search_opened: boolean = false;
  search: string = '';

  @ViewChild("search_field") search_field: ElementRef;

  @Output() searched = new EventEmitter<string>();

  lock(){
    this.user.lock();
  }

  async logout() {
    this.snackBar.open("Logging out...", "OK", {
      duration: 5000,
    });

    await this.api.logout();
    this.user.logout();
  }

  toggleSearch(btn_click = true, close = null) {
    if(close != null && close === false){
      this.search = '';
      this.search_field.nativeElement.blur();
      this.search_changed();
      return;
    }

    if ((this.search_opened && this.search.trim() == '') || !this.search_opened){
      this.search_opened = !this.search_opened;
    }

    if (btn_click && this.search_opened){
      this.search_field.nativeElement.focus();
    }
  }

  search_changed(){
    this.searched.emit(this.search);
  }

  addPW(){
    this.dialog.open(PasswordOverlayComponent);
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private breakpointObserver: BreakpointObserver, public dialog: MatDialog, public user: UserService, private api: ApiService, private snackBar: MatSnackBar) {
  }

}
