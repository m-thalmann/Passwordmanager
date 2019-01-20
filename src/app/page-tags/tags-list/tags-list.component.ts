import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PasswordsService } from 'src/app/passwords.service';
import { Password } from 'src/app/api.service';

@Component({
  selector: 'app-tags-list',
  templateUrl: './tags-list.component.html',
  styleUrls: ['./tags-list.component.scss']
})
export class TagsListComponent {
  set tagName(name: string){
    name = name.toLowerCase();

    this.tag_name = name;

    this.passwords.unlock().then(() => {
      this.pwords = this.passwords.get().filter(password => {
        return password.tags.map(tag => tag.toLowerCase()).indexOf(name) != -1;
      });
    });
  }

  tag_name: string = null;

  pwords: Password[] = null;

  constructor(private route: ActivatedRoute, private passwords: PasswordsService) {
    this.tagName = this.route.snapshot.params['name'];

    this.route.params.subscribe(params => {
      this.tagName = params['name'];
    });
  }
}
