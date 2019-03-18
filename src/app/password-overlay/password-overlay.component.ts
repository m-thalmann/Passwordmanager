import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatAutocomplete, MatChipInputEvent, MatAutocompleteSelectedEvent, MatDialog } from '@angular/material';
import { Password } from '../api.service';
import { PasswordsService } from '../passwords.service';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { TagIconPipe } from '../tag-icon.pipe';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { deepEquals, trimObject } from '../functions';
import { ConfirmOverlayComponent } from '../confirm-overlay/confirm-overlay.component';
import { BookmarksService } from '../bookmarks.service';
import { RandompassService } from '../randompass.service';

@Component({
  selector: 'app-password-overlay',
  templateUrl: './password-overlay.component.html',
  styleUrls: ['./password-overlay.component.scss']
})
export class PasswordOverlayComponent implements OnInit {
  edit_mode: boolean = false;
  saving: boolean = false;
  pword: Password = null;

  form: FormGroup;

  @ViewChild('password_input') passvalue;

  tags_all: string[] = Object.keys(TagIconPipe.known).map(tag => tag.toLowerCase());
  tagsCtrl = new FormControl();
  filteredTags: Observable<string[]>;
  tags: string[] = [];

  private deleted: boolean = false;

  @ViewChild('tagsInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('autocomplete_tags') matAutocomplete: MatAutocomplete;

  private default_data: Password = null;

  constructor(public dialogRef: MatDialogRef<PasswordOverlayComponent>, @Inject(MAT_DIALOG_DATA) public data: any, public password: PasswordsService,
    private fb: FormBuilder, private dialog: MatDialog, private bookmarks: BookmarksService, private random: RandompassService) { }

  ngOnInit() {
    this.dialogRef.beforeClose().subscribe(() => {
      if(!this.deleted && this.edit_mode && this.changed){
        this.dialog.open(ConfirmOverlayComponent, {
          data: { title: 'Save', message: 'You have unsaved local changes. Do you want to save them?' }
        }).afterClosed().subscribe(ret => {
          if (ret === true) {
            this.save();
          }
        })
      }
    });

    if(this.data && this.data.edit){
      this.edit_mode = this.data.edit;
    }

    if(this.data && this.data.password){
      this.pword = this.data.password;
    }else{
      this.edit_mode = true;
      this.pword = {
        id: -1,
        enc_key: null,
        data: {},
        last_changed: null,
        tags: []
      };
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

    this.filteredTags = this.tagsCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => tag ? this._filter_tag(tag) : this.tags_all.slice()));

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

    this.tags = this.default_data.tags.map(tag => tag.toLowerCase());
  }

  get changed(){
    let value: Password = JSON.parse(JSON.stringify(this.form.value));

    return !deepEquals(trimObject(value), trimObject(this.default_data.data)) || !deepEquals(this.tags, this.default_data.tags);
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

  removeAdditional(i: number){
    this.additional.removeAt(i);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  async toggleEdit(save: boolean = true){
    if(this.edit_mode){
      if(save){
        if(this.changed){
          this.saving = true;
          await this.save();
          this.saving = false;
        }
      }else{
        this.setFormData();
      }
    }

    this.edit_mode = !this.edit_mode;
  }

  async save(){
    this.default_data.data = JSON.parse(JSON.stringify(trimObject(this.form.value)));
    this.default_data.tags = this.tags.slice();
    this.default_data._id = await this.password.update(this.default_data);

    this.setFormData();
  }

  add_tag(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      if ((value || '').trim()) {
        let tag = value.trim();

        if(this.tags.indexOf(tag.toLowerCase()) == -1){
          this.tags.push(tag.toLowerCase());
        }
      }

      if (input) {
        input.value = '';
      }

      this.tagsCtrl.setValue(null);
    }
  }

  remove_tag(tag: string): void {
    const index = this.tags.indexOf(tag.toLowerCase());

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  selected_tag(event: MatAutocompleteSelectedEvent): void {
    if(this.tags.indexOf(event.option.viewValue.toLowerCase()) == -1){
      this.tags.push(event.option.viewValue.toLowerCase());
    }
    this.tagInput.nativeElement.value = '';
    this.tagsCtrl.setValue(null);
  }

  private _filter_tag(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.tags_all.filter(tag => tag.toLowerCase().indexOf(filterValue) === 0 && this.tags.indexOf(tag.toLowerCase()) == -1);
  }

  remove(){
    this.dialog.open(ConfirmOverlayComponent, {
      data: { title: 'Warning', message: 'Do you really want to delete this password?', critical: true }
    }).afterClosed().subscribe(async ret => {
      if(ret === true){
        this.deleted = true;

        this.dialogRef.close();

        await this.password.remove(this.default_data);
      }
    })
  }

  isBookmarked(){
    if(this.default_data._id){
      return this.bookmarks.is(this.default_data._id);
    }else{
      return false;
    }
  }

  toggleBookmarked(){
    if(this.default_data._id){
      this.bookmarks.toggle(this.default_data._id);
    }
  }

  hasId(){
    return !!this.default_data._id;
  }

  get last_changed(){
    return this.default_data.last_changed;
  }

  genpass() {
    let pass = this.random.generate();
    this.passvalue.nativeElement.value = pass;
    this.passvalue.nativeElement.type = 'text';

  }

}
