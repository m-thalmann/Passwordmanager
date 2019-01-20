import { Component, OnInit } from '@angular/core';
import { PasswordsService } from '../passwords.service';

@Component({
  selector: 'app-page-passwords',
  templateUrl: './page-passwords.component.html',
  styleUrls: ['./page-passwords.component.scss']
})
export class PagePasswordsComponent implements OnInit{
  pwords = null;

  constructor(private passwords: PasswordsService) {
  }

  ngOnInit() {
    this.passwords.unlock().then(() => {
      this.pwords = this.passwords.get();
    });
  }
}
