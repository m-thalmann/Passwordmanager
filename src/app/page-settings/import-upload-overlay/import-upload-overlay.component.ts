import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-import-upload-overlay',
  templateUrl: './import-upload-overlay.component.html',
  styleUrls: ['./import-upload-overlay.component.scss']
})
export class ImportUploadOverlayComponent {

  constructor(public dialogRef: MatDialogRef<ImportUploadOverlayComponent>) { }

}
