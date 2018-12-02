import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API_URL = 'https://reqres.in/api/';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  login(email: string, password: string) {
    return this.http.post(API_URL + 'login', {
      email: email,
      password: password
    });
  }
}
