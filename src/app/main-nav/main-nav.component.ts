import { Component, ElementRef, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, NavigationStart } from '@angular/router';
import { MatDialog } from '@angular/material';
import { AboutDialogComponent } from '../about-dialog/about-dialog.component';
import { UserService } from '../user.service';

@Component({
  selector: 'main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss'],
})
export class MainNavComponent {

  username: string = 'Guest';
  currentRoute: string = '/';
  search_opened: boolean = false;
  search: string = '';

  @ViewChild("search_field") search_field: ElementRef;

  logout() {
    this.user.logout();
  }

  showAbout() {
    const dialogRef = this.dialog.open(AboutDialogComponent, {
      width: '250px'
    });
  }

  toggleSearch(btn_click = true) {
    if ((this.search_opened && this.search.trim() == '') || !this.search_opened){
      this.search_opened = !this.search_opened;
    }

    if (btn_click && this.search_opened){
      this.search_field.nativeElement.focus();

      // TODO: search
    }
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private breakpointObserver: BreakpointObserver, private router: Router, public dialog: MatDialog, private user: UserService) {
    this.router.events.subscribe(event => {
      if(event instanceof NavigationStart) {
        this.currentRoute = event.url;
      }
    });
  }

}
