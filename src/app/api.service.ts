import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Md5Pipe } from './md5.pipe';

import { Config } from '../config/config';
import { UserService } from './user.service';

const API_URL = Config.api_url;

export interface LoginResult{
  user: {
    id: number,
    username: string,
    email: string,
    active: boolean
  },
  token: string
}

export interface Settings{
  email?: string,
  password?: string
}

export interface PasswordAPI{
  id: number,
  enc_key: string,
  data: string,
  last_changed: string,
  tags: string[]
}

export interface PasswordDexie extends PasswordAPI{
  _id?: number
}

export interface Password{
  _id?: number,
  id: number,
  enc_key: string,
  data: {
    name?: string,
    username?: string,
    password?: string,
    domain?: string,
    additional_data?: {
      name: string,
      value: string
    }[]
  },
  last_changed: string,
  tags: string[]
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

  register(username: string, email: string, password: string){
    let params = new HttpParams()
      .append('username', username)
      .append('email', email)
      .append('password', new Md5Pipe().transform(password));

    return this.http.post<{info: string}>(API_URL + 'register', params);
  }

  registrationEnabled(){
    return this.http.get<{value: boolean}>(API_URL + 'registration_enabled');
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

  async loadPasswords(){
    try {
      let ret = await this.http.get<PasswordAPI[]>(API_URL + 'load/' + this.user.token).toPromise();

      return ret;
    } catch (e) {
      if (e.status == 403) {
        this.user.logout();
      } else {
        throw e;
      }
    }
  }

  async loadHeaders(id?: number){
    try {
      let ret = await this.http.get<{id: number, last_changed: string}[]>(API_URL + 'load/headers/' + this.user.token + (id ? '/' + id : '')).toPromise();

      return ret;
    } catch (e) {
      if (e.status == 403) {
        this.user.logout();
      } else {
        throw e;
      }
    }
  }

  async deletePassword(id: number){
    try {
      let ret = await this.http.delete(API_URL + 'delete/' + this.user.token + '/' + id).toPromise();

      return ret;
    } catch (e) {
      if (e.status == 403) {
        this.user.logout();
      } else {
        throw e;
      }
    }
  }

  async updatePasswords(passwords: PasswordAPI[]){
    try {
      let params = new HttpParams()
        .append('data', JSON.stringify(passwords).replace(/\+/gi, '%2B'));

      let ret = await this.http.post<number[]>(API_URL + 'update/' + this.user.token, params).toPromise();

      return ret;
    } catch (e) {
      if (e.status == 403) {
        this.user.logout();
      } else {
        throw e;
      }
    }
  }

  async updatePassword(password: PasswordAPI){
    return (await this.updatePasswords([password]))[0];
  }
}
