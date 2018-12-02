import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, NavigationStart } from '@angular/router';
import { MatDialog } from '@angular/material';
import { AboutDialogComponent } from '../about-dialog/about-dialog.component';

@Component({
  selector: 'main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss'],
})
export class MainNavComponent {

  username: string = 'Guest';
  currentRoute: string = '/';

  logout() {
    console.warn("TODO: implement");
  }

  showAbout() {
    console.warn("TODO: implement");
    const dialogRef = this.dialog.open(AboutDialogComponent, {
      width: '250px'
    });
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private breakpointObserver: BreakpointObserver, private router: Router, public dialog: MatDialog) {
    router.events.subscribe(event => {
      if(event instanceof NavigationStart) {
        this.currentRoute = event.url;
      }
    });
  }

}
