import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA, MatDialog } from '@angular/material';
import { PasswordsService } from 'src/app/passwords.service';
import { Password } from 'src/app/api.service';
import { downloadURI } from 'src/app/functions';
import { PromptOverlayComponent } from 'src/app/prompt-overlay/prompt-overlay.component';
import { Md5Pipe } from 'src/app/md5.pipe';

@Component({
  selector: 'app-export-import-bottom-sheet',
  templateUrl: './export-import-bottom-sheet.component.html',
  styleUrls: ['./export-import-bottom-sheet.component.scss']
})
export class ExportImportBottomSheetComponent implements OnInit {

  constructor(private bottomSheetRef: MatBottomSheetRef<ExportImportBottomSheetComponent>, private passwords: PasswordsService,
    @Inject(MAT_BOTTOM_SHEET_DATA) private data: string, private dialog: MatDialog) { }

  get isExport(){
    return this.data == 'export';
  }

  get isImport(){
    return this.data == 'import';
  }

  ngOnInit() {
  }

  encrypted(){
    this.dialog.open(PromptOverlayComponent, {
      data: { title: 'Information', message: 'Please enter the password for the encryption:', placeholder: 'Password', type: 'password' }
    }).afterClosed().subscribe(async password => {
      if(password != null){
        password = new Md5Pipe().transform(password);

        await this.passwords.unlock();

        if(this.isExport){
          // Export encrypted
          let header: string = 'id;enc_key,data,tags';
          let rows: string[][] = [];

          this.passwords.encryptCollection(this.passwords.snapshot, password).forEach(pw => {
            let row: string[] = [];

            row.push(pw.id.toString());
            row.push(pw.enc_key);
            row.push(pw.data);
            row.push(pw.tags ? pw.tags.join(',') : '');

            rows.push(row);
          });

          let body = rows.map(row => row.join(';')).join('\n');

          this.export(header + '\n' + body);
        }
      }

      this.bottomSheetRef.dismiss();
    });
  }

  async decrypted(){
    await this.passwords.unlock();

    if(this.isExport){
      // Export decrypted
      let header: string = 'id;name;username;password;domain;tags';
      const header_length = 6;

      let rows: string[][] = [];

      let additional_headers: string[] = [];

      console.log(1);

      this.passwords.snapshot.forEach((pw: Password) => {
        let row: string[] = [];
        console.log(2);
        
        row.push(pw.id.toString());
        row.push(pw.data.name ? pw.data.name : '');
        row.push(pw.data.username ? pw.data.username : '');
        row.push(pw.data.password ? pw.data.password : '');
        row.push(pw.data.domain ? pw.data.domain : '');
        row.push(pw.tags ? pw.tags.join(',') : '');

        if(pw.data.additional_data){
          pw.data.additional_data.forEach(dt => {
            let pos = additional_headers.indexOf(dt.name);
            if(pos != -1){
              row[header_length + pos] = dt.value;
            }else{
              additional_headers.push(dt.name);
              row[header_length + additional_headers.length - 1] = dt.value;
            }
          });
        }

        rows.push(row);
      });

      if(additional_headers.length > 0){
        header += ";" + additional_headers.join(";");
        
        rows = rows.map(row => {
          if(row.length != header_length + additional_headers.length){
            for(let i = row.length; i < header_length + additional_headers.length; i++){
              row[i] = '';
            }
          }
          return row;
        });
      }

      let body = rows.map(row => row.join(';')).join('\n');

      this.export(header + '\n' + body);
    }else if(this.isImport){
      // Import decrypted
    }

    this.bottomSheetRef.dismiss();
  }

  private export(data: string){
    downloadURI(encodeURI('data:application/csv;charset=utf-8,' + data), 'export.csv');
  }
}
