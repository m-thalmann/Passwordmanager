import { Component, OnInit } from '@angular/core';
import { PasswordsService } from '../passwords.service';

interface Tag{
  name: string,
  amount: number
}

@Component({
  selector: 'app-page-tags',
  templateUrl: './page-tags.component.html',
  styleUrls: ['./page-tags.component.scss']
})
export class PageTagsComponent implements OnInit {
  tags: Tag[] = null;
  
  constructor(private passwords: PasswordsService) { }
  
  ngOnInit() {
    this.passwords.unlock().then(() => {
      this.tags = [];
      this.passwords.get().forEach(password => {
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
    });
  }
}
