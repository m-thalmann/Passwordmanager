import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CheckService {

  constructor() { }

  _checked: any[] = [];

  get checked() {
    return this._checked;
  }

  set checked(checked) {
    this._checked = checked;
  }

  contains(index: number) {
    let ret = false;
    this.checked.forEach(pass => {
      if(pass["index"] == index) {
        ret = true;
      }
    });
    return ret;
  }
}
