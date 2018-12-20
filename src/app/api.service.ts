import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Md5Pipe } from './md5.pipe';

const API_URL = 'http://127.0.0.1:8080/';

interface LoginResult{
  user: {
    id: number,
    username: string,
    email: string,
    active: boolean
  },
  token: string
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    let params = new HttpParams()
      .append('username', username)
      .append('password', new Md5Pipe().transform(password));

    return this.http.post<LoginResult>(API_URL + 'login', params);
  }
}
