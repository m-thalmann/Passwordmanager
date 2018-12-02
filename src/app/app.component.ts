import { Component } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  show_menu: boolean = false;

  constructor(private router: Router) {
    this.show_menu = !this.router.url.startsWith("/login") && !this.router.url.startsWith("/register");
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.show_menu = !event.url.startsWith("/login") && !event.url.startsWith("/register");
      }
    });
  }
}
