import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AboutDialogComponent } from '../about-dialog/about-dialog.component';
import { Password } from '../api.service';
import { PasswordsService } from '../passwords.service';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-password-overlay',
  templateUrl: './password-overlay.component.html',
  styleUrls: ['./password-overlay.component.scss']
})
export class PasswordOverlayComponent implements OnInit {
  edit_mode: boolean = false;
  pword: Password = null;

  form: FormGroup;

  private default_data: Password = null;

  constructor(public dialogRef: MatDialogRef<AboutDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, public password: PasswordsService, private fb: FormBuilder) { }

  ngOnInit() {
    this.dialogRef.beforeClose().subscribe(() => {
      if(this.edit_mode){
        // TODO: ask if save wanted after check that unsaved changes exist
      }
    });

    if(this.data.edit){
      this.edit_mode = this.data.edit;
    }

    if(this.data.password){
      this.pword = this.data.password;
    }else{
      this.edit_mode = true;
      this.pword = {
        id: -1,
        enc_key: null,
        data: {},
        last_changed: null,
        tags: []
      }
    }

    this.form = this.fb.group({
      name: ['', [
      ]],
      username: ['', [
      ]],
      password: ['', [
      ]],
      domain: ['', [
      ]],
      additional_data: this.fb.array([]),
    });

    this.default_data = JSON.parse(JSON.stringify(this.pword));

    this.setFormData();
  }

  private setFormData(){
    this.pword = JSON.parse(JSON.stringify(this.default_data));

    this.form.controls['name'].setValue(this.pword.data.name ? this.pword.data.name : '');
    this.form.controls['username'].setValue(this.pword.data.username ? this.pword.data.username : '');
    this.form.controls['password'].setValue(this.pword.data.password ? this.pword.data.password : '');
    this.form.controls['domain'].setValue(this.pword.data.domain ? this.pword.data.domain : '');

    this.additional.controls = [];

    if(this.pword.data.additional_data){
      this.pword.data.additional_data.forEach(el => {
        this.addAdditional(el.name, el.value);
      });
    }
  }

  private get changed(){
    let value = this.form.value;
    // TODO: implement

    // value = value.filter(val => val && val.trim().length > 0);
    
    // return (Object.keys(value).every(key => 
    //   this.default_data.data[key] && this.default_data.data[key] == value[key]
    // ) && Object.keys(this.default_data.data).every(key =>
    //   value[key] && value[key] == this.default_data.data[key]  
    // ));
    return true;
  }

  get additional(){
    return this.form.get('additional_data') as FormArray;
  }

  addAdditional(name?: string, value?: string){
    const additional_data = this.fb.group({
      name: name ? name : '',
      value: value ? value : '',
    });

    this.additional.push(additional_data);
  }

  removeAdditional(i){
    this.additional.removeAt(i);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  toggleEdit(save: boolean = true){
    if(this.edit_mode){
      if(save){
        // TODO: save after check that unsaved changes exist
        console.log(this.changed);
      }else{
        this.setFormData();
      }
    }
    
    this.edit_mode = !this.edit_mode;
  }

}
