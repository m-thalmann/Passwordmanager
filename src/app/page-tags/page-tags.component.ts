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
  private _tags: Tag[] = [];
  private search: string = null;

  get tags(){
    if(this.search == null || this.search.trim().length == 0){
      return this._tags;
    }
    return this._tags.filter(tag => tag.name.indexOf(this.search) != -1);
  }

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
    this._tags = [];
    pwords.forEach(password => {
      password.tags.forEach(tag => {
        let pos = this._tags.map(el => el.name).indexOf(tag);
        if(pos == -1){
          this._tags.push({
            name: tag,
            amount: 1
          });
        }else{
          this._tags[pos].amount++;
        }
      });
    });
  }

  searched(search: string){
    this.search = search;
  }
}
