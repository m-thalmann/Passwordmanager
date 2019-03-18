import { CheckService } from './../check.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PasswordsService } from '../passwords.service';
import { Password } from '../api.service';
import * as sha1 from 'sha1';



@Component({
  selector: 'app-page-passwords',
  templateUrl: './page-passwords.component.html',
  styleUrls: ['./page-passwords.component.scss']
})
export class PagePasswordsComponent implements OnInit, OnDestroy{
  private _pwords = null;
  private search = null;


  get pwords(){
    return PasswordsService.search(this._pwords, this.search);
  }



  private pword_subscription = null;

  constructor(private passwords: PasswordsService, private http: HttpClient, private checked: CheckService) {
  }

  ngOnInit() {
    this.passwords.unlock().then(() => {
      this._pwords = this.passwords.snapshot;

      this.pword_subscription = this.passwords.get().subscribe((data: Password[]) => {
        this._pwords = data;
      });

      this.check();

    });



  }

  ngOnDestroy() {
    this.pword_subscription.unsubscribe();
  }

  searched(search: string) {
    this.search = search;
  }

  async check() {
    let index = 0;
    let res = [];
    this._pwords.map(async pword => {
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
      this.checked.checked = res;
    });
  }
}
