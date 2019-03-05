import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordsService } from 'src/app/passwords.service';
import { Password } from 'src/app/api.service';

@Component({
  selector: 'app-tags-list',
  templateUrl: './tags-list.component.html',
  styleUrls: ['./tags-list.component.scss']
})
export class TagsListComponent implements OnDestroy {
  private pword_subscription = null;
  private search: string = null;

  set tagName(name: string){
    name = name.toLowerCase();

    this.tag_name = name;

    this.passwords.unlock().then(() => {
      this.setPasswords(this.passwords.snapshot);
      
      this.pword_subscription = this.passwords.get().subscribe((data: Password[]) => {
        this.setPasswords(data);
      })
    });
  }

  private setPasswords(pwords: Password[]){
    this._pwords = pwords.filter(password => {
      return password.tags.map(tag => tag.toLowerCase()).indexOf(this.tag_name) != -1;
    });
  }

  tag_name: string = null;

  private _pwords: Password[] = null;

  get pwords(){
    return PasswordsService.search(this._pwords, this.search);
  }

  constructor(private route: ActivatedRoute, private passwords: PasswordsService, private router: Router) {
    this.tagName = this.route.snapshot.params['name'];

    this.route.params.subscribe(params => {
      this.tagName = params['name'];
    });
  }

  ngOnDestroy() {
    this.pword_subscription.unsubscribe();
  }

  back(){
    this.router.navigateByUrl('/tags');
  }

  searched(search: string){
    this.search = search;
  }
}
