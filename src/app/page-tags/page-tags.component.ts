import { Component, OnInit, OnDestroy } from '@angular/core';
import { PasswordsService } from '../passwords.service';
import { Password } from '../api.service';

interface Tag{
  name: string,
  amount: number
}

@Component({
  selector: 'app-page-tags',
  templateUrl: './page-tags.component.html',
  styleUrls: ['./page-tags.component.scss']
})
export class PageTagsComponent implements OnInit, OnDestroy {
  tags: Tag[] = [];

  private pword_subscription = null;

  constructor(private passwords: PasswordsService) { }
  
  ngOnInit() {
    this.passwords.unlock().then(() => {
      this.setPasswords(this.passwords.snapshot);

      this.pword_subscription = this.passwords.get().subscribe((data: Password[]) => {
        this.setPasswords(data);
      })
    });
  }

  ngOnDestroy() {
    this.pword_subscription.unsubscribe();
  }

  private setPasswords(pwords: Password[]){
    this.tags = [];
    pwords.forEach(password => {
      password.tags.forEach(tag => {
        let pos = this.tags.map(el => el.name).indexOf(tag);
        if(pos == -1){
          this.tags.push({
            name: tag,
            amount: 1
          });
        }else{
          this.tags[pos].amount++;
        }
      });
    });
  }
}
