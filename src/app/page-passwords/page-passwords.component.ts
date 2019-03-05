import { Component, OnInit, OnDestroy } from '@angular/core';
import { PasswordsService } from '../passwords.service';
import { Password } from '../api.service';

@Component({
  selector: 'app-page-passwords',
  templateUrl: './page-passwords.component.html',
  styleUrls: ['./page-passwords.component.scss']
})
export class PagePasswordsComponent implements OnInit, OnDestroy{
  pwords = null;

  private pword_subscription = null;

  constructor(private passwords: PasswordsService) {
  }

  ngOnInit() {
    this.passwords.unlock().then(() => {
      this.pwords = this.passwords.snapshot;

      this.pword_subscription = this.passwords.get().subscribe((data: Password[]) => {
        this.pwords = data;
      })
    });
  }

  ngOnDestroy() {
    this.pword_subscription.unsubscribe();
  }
}
