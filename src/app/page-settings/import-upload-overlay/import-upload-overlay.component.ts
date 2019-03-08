import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-import-upload-overlay',
  templateUrl: './import-upload-overlay.component.html',
  styleUrls: ['./import-upload-overlay.component.scss']
})
export class ImportUploadOverlayComponent {
  private file: any;

  constructor(public dialogRef: MatDialogRef<ImportUploadOverlayComponent>) { }

  set selectedFile(file){
    this.file = file[0];
  }

  get selectedFile(){
    if(this.file != null){
      return this.file;
    }
    return null;
  }
}
