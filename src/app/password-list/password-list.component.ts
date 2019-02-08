import { Component, Input } from '@angular/core';
import { Password } from '../api.service';
import { copyToClipboard } from '../functions';
import { MatSnackBar, MatDialog } from '@angular/material';
import { PasswordOverlayComponent } from '../password-overlay/password-overlay.component';
import { Observable } from 'rxjs';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';

@Component({
  selector: 'password-list',
  templateUrl: './password-list.component.html',
  styleUrls: ['./password-list.component.scss']
})
export class PasswordListComponent {
  @Input() passwords: Password[] = null;
  
  tag_amount: number = 10;
  tag_amount_mobile: number = 5;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private snackBar: MatSnackBar, private dialog: MatDialog, private breakpointObserver: BreakpointObserver) {}

  copy(pw: string, text: string){
    copyToClipboard(pw ? pw : "");
    this.snackBar.open(text, "OK", {
      duration: 2000,
    });
  }

  showPassword(password: Password){
    this.dialog.open(PasswordOverlayComponent, {
      data: { password: password }
    });
  }

  expandTags(container: any){
    container._elementRef.nativeElement.dataset.expanded = "true";
  }

  isExpanded(container: any){
    return container._elementRef.nativeElement.dataset.expanded == "true";
  }
}
