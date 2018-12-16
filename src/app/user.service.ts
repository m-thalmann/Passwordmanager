import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const TOKEN = 'TOKEN';
const USER = 'USER';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private router: Router) { }

  login(userinfo, token): void {
    localStorage.setItem(TOKEN, token);
    localStorage.setItem(USER, JSON.stringify(userinfo));
  }

  logout() {
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(USER);
    this.router.navigateByUrl("/login");
  }

  isLoggedin() {
    return localStorage.getItem(TOKEN) != null;
  }
}
