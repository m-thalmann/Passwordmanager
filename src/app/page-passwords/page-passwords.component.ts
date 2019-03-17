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
  private check_subscription = null;

  constructor(private passwords: PasswordsService, private http: HttpClient) {
  }

  ngOnInit() {
    this.passwords.unlock().then(() => {
      this._pwords = this.passwords.snapshot;

      this.pword_subscription = this.passwords.get().subscribe((data: Password[]) => {
        this._pwords = data;
      });
    });
  }

  ngOnDestroy() {
    this.pword_subscription.unsubscribe();
    this.check_subscription.unsubscribe();
  }

  searched(search: string) {
    this.search = search;
  }
  async check() {

    this._pwords.map(pword => {
      let encrypted = pword['data']['password'];
      encrypted = sha1(encrypted);
      let shortenc = encrypted.substring(0, 5);
      this.check_subscription = this.http.get('https://api.pwnedpasswords.com/range/' + shortenc, {responseType: 'text'}).subscribe(data => {
        let arr = data.split('\n');
        arr.forEach(hash => {
          if ( encrypted.toUpperCase() === shortenc.toUpperCase() + hash.substring(0, hash.indexOf(':'))) {
            console.log('found password ' + hash.substring(hash.indexOf(':')) + ' times');
          }
        });
      });

  });
}
}
