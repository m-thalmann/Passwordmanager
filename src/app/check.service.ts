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

  contains(index: number) {
    let ret = false;
    this.checked.forEach(pass => {
      if(pass["index"] == index) {
        ret = true;
      }
    });
    return ret;
  }

  async check(pwords) {
    let index = 0;
    let res = [];
    pwords.map(async pword => {
      let encrypted = pword['data']['password'];
      encrypted = sha1(encrypted);
      let shortenc = encrypted.substring(0, 5);
      let data = await this.http.get('https://api.pwnedpasswords.com/range/' + shortenc, {responseType: 'text'}).toPromise();

      let arr = data.split('\n');
      arr.forEach(hash => {
        if ( encrypted.toUpperCase() === shortenc.toUpperCase() + hash.substring(0, hash.indexOf(':'))) {
          res.push({"index": index, "times": hash.substring(hash.indexOf(':')+1,hash.indexOf("\r"))})
        }
      });
      index ++;
      this.checked = res;
    });
  }
}
