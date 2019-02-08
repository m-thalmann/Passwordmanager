import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

interface DialogData {
  title: string,
  message: string,
  critical?: boolean
}

@Component({
  selector: 'app-confirm-overlay',
  templateUrl: './confirm-overlay.component.html',
  styleUrls: ['./confirm-overlay.component.scss']
})
export class ConfirmOverlayComponent {

  constructor(public dialogRef: MatDialogRef<ConfirmOverlayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }
}