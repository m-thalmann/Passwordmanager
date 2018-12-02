import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const TOKEN = 'TOKEN';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private router: Router) { }

  setToken(token: string): void {
    sessionStorage.setItem(TOKEN, token);
  }

  logout() {
    sessionStorage.removeItem(TOKEN);
    this.router.navigateByUrl("/login");
  }

  isLoggedin() {
    return sessionStorage.getItem(TOKEN) != null;
  }
}
