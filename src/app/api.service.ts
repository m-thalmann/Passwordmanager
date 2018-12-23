import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Md5Pipe } from './md5.pipe';

import { Config } from '../config/config';
import { UserService } from './user.service';

const API_URL = Config.api_url;

interface LoginResult{
  user: {
    id: number,
    username: string,
    email: string,
    active: boolean
  },
  token: string
}

interface Settings{
  email?: string,
  password?: string
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private user: UserService) { }

  login(username: string, password: string) {
    let params = new HttpParams()
      .append('username', username)
      .append('password', new Md5Pipe().transform(password));

    return this.http.post<LoginResult>(API_URL + 'login', params);
  }

  async checkAuth(){
    try{
      let ret = await this.http.get(API_URL + 'auth/' + this.user.token).toPromise();

      return ret;
    }catch(e){
      this.user.logout();
    }
  }

  async logout(){
    try {
      let ret = await this.http.get(API_URL + 'logout/' + this.user.token).toPromise();

      return ret;
    } catch (e) {
      console.error(e);
    }
  }

  async logoutId(id: number){
    try {
      let ret = await this.http.get(API_URL + 'logout/' + this.user.token + '/' + id).toPromise();

      return ret;
    } catch (e) {
      if (e.status == 403) {
        this.user.logout();
      } else {
        throw e;
      }
    }
  }

  async logoutAll(){
    try {
      let ret = await this.http.get(API_URL + 'logout_all/' + this.user.token).toPromise();

      return ret;
    } catch (e) {
      console.error(e);
    }
  }

  async updateSettings(settings: Settings){
    let params = new HttpParams();

    if(settings.email){
      params = params.append('email', settings.email);
    }
    if(settings.password){
      // TODO: change all saved password keys to the one with new password (+ pushing them to server) before updating password
      params = params.append('password', new Md5Pipe().transform(settings.password));
    }

    try{
      let ret = await this.http.post(API_URL + 'settings/' + this.user.token, params).toPromise();

      return ret;
    }catch(e){
      if(e.status == 403){
        this.user.logout();
      }else{
        throw e;
      }
    }
  }

  async getLogins(){
    try {
      let ret = await this.http.get(API_URL + 'logins/' + this.user.token).toPromise();

      return ret;
    } catch (e) {
      if (e.status == 403) {
        this.user.logout();
      } else {
        throw e;
      }
    }
  }
}
