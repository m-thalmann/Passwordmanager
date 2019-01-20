import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { AboutDialogComponent } from '../about-dialog/about-dialog.component';

@Component({
  selector: 'app-password-overlay',
  templateUrl: './password-overlay.component.html',
  styleUrls: ['./password-overlay.component.scss']
})
export class PasswordOverlayComponent {

  constructor(public dialogRef: MatDialogRef<AboutDialogComponent>) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
