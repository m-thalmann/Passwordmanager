import { CheckService } from './../check.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PasswordsService } from '../passwords.service';
import { Password } from '../api.service';

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

  constructor(private passwords: PasswordsService,  private check: CheckService) {
  }

  ngOnInit() {
    this.passwords.unlock().then(() => {
      this._pwords = this.passwords.snapshot;

      this.pword_subscription = this.passwords.get().subscribe((data: Password[]) => {
        this._pwords = data;
        this.check.check(data);
      });

      this.check.check(this._pwords);
    });
  }

  ngOnDestroy() {
    this.pword_subscription.unsubscribe();
  }

  searched(search: string) {
    this.search = search;
  }


}
