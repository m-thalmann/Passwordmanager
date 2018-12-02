import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-about-dialog',
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.scss']
})
export class AboutDialogComponent{

  constructor(public dialogRef: MatDialogRef<AboutDialogComponent>) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
