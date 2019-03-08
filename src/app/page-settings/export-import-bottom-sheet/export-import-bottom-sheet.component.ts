import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA, MatDialog, MatSnackBar } from '@angular/material';
import { PasswordsService } from 'src/app/passwords.service';
import { Password } from 'src/app/api.service';
import { downloadURI } from 'src/app/functions';
import { PromptOverlayComponent } from 'src/app/prompt-overlay/prompt-overlay.component';
import { Md5Pipe } from 'src/app/md5.pipe';
import { ImportUploadOverlayComponent } from '../import-upload-overlay/import-upload-overlay.component';

const NEW_LINE_CHAR = '\r\n';
const HEADERS = [
  'id',
  'name',
  'username',
  'password',
  'domain',
  'tags',
];

@Component({
  selector: 'app-export-import-bottom-sheet',
  templateUrl: './export-import-bottom-sheet.component.html',
  styleUrls: ['./export-import-bottom-sheet.component.scss']
})
export class ExportImportBottomSheetComponent implements OnInit {

  constructor(private bottomSheetRef: MatBottomSheetRef<ExportImportBottomSheetComponent>, private passwords: PasswordsService,
    @Inject(MAT_BOTTOM_SHEET_DATA) private data: string, private dialog: MatDialog, private snackBar: MatSnackBar) { }

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
          let header: string = 'id;enc_key;data;tags';
          let rows: string[][] = [];

          this.passwords.encryptCollection(this.passwords.snapshot, password).forEach(pw => {
            let row: string[] = [];

            row.push(pw.id.toString());
            row.push(pw.enc_key);
            row.push(pw.data);
            row.push(pw.tags ? pw.tags.join(',') : '');

            rows.push(row);
          });

          let body = rows.map(row => row.join(';')).join(NEW_LINE_CHAR);

          this.export(header + NEW_LINE_CHAR + body);
        }else if(this.isImport){
          // Import encrypted
          
          try{
            let body: string[][] = await this.getImportData();
    
            let header: string[] = body.splice(0, 1)[0];

            if(header.indexOf('enc_key') == -1 || header.indexOf('data') == -1){
              throw 'File not compatible';
            }

            let id_pos = header.indexOf('id');
            let enc_key_pos = header.indexOf('enc_key');
            let data_pos = header.indexOf('data');
            let last_changed_pos = header.indexOf('last_changed');
            let tags_pos = header.indexOf('tags');

            let self = this;
            let wrong_pw = 0;

            await Promise.all(body.map((row: any) => {
              return async function(){
                let tags = [];
  
                if(tags_pos != -1){
                  tags = row[tags_pos].split(',');
                }

                try{
                  let pw = await self.passwords.decrypt({
                    id: id_pos != -1 ? parseInt(row[id_pos]) : -1,
                    enc_key: row[enc_key_pos],
                    data: row[data_pos],
                    last_changed: last_changed_pos != -1 ? row[last_changed_pos] : null,
                    tags: tags
                  }, password);
  
                  await self.passwords.update(pw);
                }catch(e){
                  wrong_pw++;
                }
              }();
            }));

            if(wrong_pw == body.length){
              throw 'Error decrypting! Maybe you have the wrong password?';
            }

            let success_text = "Imported successfully";

            if(wrong_pw > 0){
              success_text += " (" + wrong_pw + " failed)";
            }

            this.snackBar.open(success_text, "OK", {
              duration: 5000
            });
          }catch(e){
            this.snackBar.open(e, "OK", {
              duration: 5000,
              panelClass: 'snackbar_error'
            });
          }
        }
      }

      this.bottomSheetRef.dismiss();
    });
  }

  async decrypted(){
    await this.passwords.unlock();

    if(this.isExport){
      // Export decrypted
      let header: string = HEADERS.join(';');
      const header_length = HEADERS.length;

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

      let body = rows.map(row => row.join(';')).join(NEW_LINE_CHAR);

      this.export(header + NEW_LINE_CHAR + body);
    }else if(this.isImport){
      // Import decrypted

      try{
        let body: string[][] = await this.getImportData();

        if(body != null){
          let header: string[] = body.splice(0, 1)[0];
  
          this.importDecrypted(header, body);
        }
      }catch(e){
        this.snackBar.open(e, "OK", {
          duration: 5000,
          panelClass: 'snackbar_error'
        });
      }
    }

    this.bottomSheetRef.dismiss();
  }

  private export(data: string){
    downloadURI(encodeURI('data:application/csv;charset=utf-8,' + data), 'export.csv');
  }

  private async importDecrypted(header: string[], body: string[][]){
    let passwords: Password[] = [];

    body.forEach(row => {
      let password = {
        id: -1,
        enc_key: null,
        data: {},
        last_changed: null,
        tags: []
      };

      row.forEach((col, index) => {
        if(col != null && col.trim().length > 0){
          if(HEADERS.indexOf(header[index]) == -1){
            if(!password['data']['additional_data']){
              password['data']['additional_data'] = [];
            }

            let pos = password['data']['additional_data'].map((dt: { name: string, value: string }) => dt.name).indexOf(header[index]);

            if(pos != -1){
              password['data']['additional_data'][pos] = {
                name: header[index],
                value: col
              };
            }else{
              password['data']['additional_data'].push({
                name: header[index],
                value: col
              });
            }
          }else if(header[index] == 'id'){
            password.id = parseInt(col);
          }else if(header[index] == 'enc_key'){
            password.enc_key = col;
          }else if(header[index] == 'last_changed'){
            password.last_changed = col;
          }else if(header[index] == 'tags'){
            password.tags = col.split(',');
          }else{
            password['data'][header[index]] = col;
          }
        }
      });

      passwords.push(<Password>password);
    });

    await Promise.all(passwords.map(pw => this.passwords.update(pw)));

    this.snackBar.open("Imported successfully", "OK", {
      duration: 5000
    });
  }

  private getImportData(): Promise<string[][]>{
    let self = this;
    return new Promise(function(resolve, reject) {
      self.dialog.open(ImportUploadOverlayComponent).afterClosed().subscribe(data => {
        if(data == null){
          resolve(null);
        }else{
          var reader = new FileReader();
          reader.readAsText(data, "UTF-8");

          reader.onload = function (evt) {
            let content: string = evt.target['result'];
            let import_data: string[][] = content.split(NEW_LINE_CHAR).map(line => {
              return line.split(';');
            });

            
            let ok = import_data.length > 0;

            let max_len = import_data.map(line => line.length).reduce(function(a, b) {
              return Math.max(a, b);
            });

            ok = ok && max_len > 0;

            ok = import_data.every(line => line.length == max_len);

            if(!ok){
              reject('File not compatible');
            }

            resolve(import_data);
          }
          reader.onerror = function () {
            reject('Error reading file');
          }
        }
      });
    });
  }
}
