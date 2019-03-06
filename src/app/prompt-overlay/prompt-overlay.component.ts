import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-prompt-overlay',
  templateUrl: './prompt-overlay.component.html',
  styleUrls: ['./prompt-overlay.component.scss']
})
export class PromptOverlayComponent {

  constructor(public dialogRef: MatDialogRef<PromptOverlayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
}
