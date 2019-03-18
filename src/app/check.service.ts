import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as sha1 from 'sha1';

@Injectable({
  providedIn: 'root'
})
export class CheckService {

  constructor(private http: HttpClient) { }

  _checked: any[] = [];

  get checked() {
    return this._checked;
  }

  set checked(checked) {
    this._checked = checked;
  }

  contains(id: number) {
    let ret = false;
    this.checked.forEach(pass => {
      if(pass["id"] == id) {
        ret = true;
      }
    });
    return ret;
  }

  async check(pwords) {
    let res = [];
    pwords.map(async pword => {
      let encrypted = pword['data']['password'];
      encrypted = sha1(encrypted);
      let shortenc = encrypted.substring(0, 5);
      let data = await this.http.get('https://api.pwnedpasswords.com/range/' + shortenc, {responseType: 'text'}).toPromise();

      let arr = data.split('\n');
      arr.forEach(hash => {
        if ( encrypted.toUpperCase() === shortenc.toUpperCase() + hash.substring(0, hash.indexOf(':'))) {
          res.push({"id": pword['id'], "times": hash.substring(hash.indexOf(':')+1,hash.indexOf("\r"))})
        }
      });
      this.checked = res;
    });
  }

  getById(id) {
    let ret = null;
    this.checked.forEach(i => {
      if(i["id"] == id) {
        ret = i;
      }
    });
    return ret;
  }
}
