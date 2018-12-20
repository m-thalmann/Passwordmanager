import { Injectable } from '@angular/core';

import { Blowfish } from 'javascript-blowfish';

const TOKEN = 'TOKEN';
const USER = 'USER';
const PW = 'PW';
const TEST_ITEM_KEY = 'TEST';
const TRIES = 'TRIES';

const TEST_ITEM: string = '94d2a3c6dd19337f2511cdf8b4bf907e==';
const MAX_TRIES: number = -1;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  password: string = null;

  login({user, token, password}): void {
    localStorage.setItem(TOKEN, token);
    localStorage.setItem(USER, JSON.stringify(user));
    localStorage.removeItem(PW);
    this.password = password;
  }

  unlock(pin: number): UserService.unlock_return{
    if(this.hasPIN()){
      let _tries = localStorage.getItem(TRIES);
      _tries = _tries ? _tries : "0";

      let tries: number = 0;

      try{
        tries = parseInt(_tries);
      }catch(e){}

      if(MAX_TRIES >= 1 && tries >= MAX_TRIES){
        return UserService.unlock_return.MAX_TRIES;
      }

      let pw = localStorage.getItem(PW);
      let bf = new Blowfish(pin.toString());

      this.password = bf.trimZeros(bf.decrypt(bf.base64Decode(pw)));

      bf = new Blowfish(this.password);
      let test_item = localStorage.getItem(TEST_ITEM_KEY);

      
      
      if(!test_item)
      return UserService.unlock_return.ERROR;

      if (bf.trimZeros(bf.decrypt(bf.base64Decode(test_item))) == TEST_ITEM){
        localStorage.setItem(TRIES, "0");
        return UserService.unlock_return.CORRECT;
      }else{
        this.password = null;
        localStorage.setItem(TRIES, (tries+1).toString());
      }
    }

    return UserService.unlock_return.WRONG;
  }
  
  logout() {
    localStorage.removeItem(TEST_ITEM_KEY);
    localStorage.removeItem(TRIES);
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(USER);
    localStorage.removeItem(PW);
    // TODO: remove all passwords
    // this.router.navigateByUrl("/login");
    location.href = "/login";
  }

  isLoggedin() {
    let token = localStorage.getItem(TOKEN) != null;
    let user = localStorage.getItem(USER) != null;

    return (token && user && this.password != null);
  }

  isKnown() {
    let token = localStorage.getItem(TOKEN) != null;
    let user = localStorage.getItem(USER) != null;

    return token && user;
  }

  hasPIN(){
    return localStorage.getItem(PW) != null;
  }

  setPIN(pin: number){
    if(this.isLoggedin()){
      let bf = new Blowfish(pin.toString());
      let pw = bf.base64Encode(bf.encrypt(this.password));
      localStorage.setItem(PW, pw);

      bf = new Blowfish(this.password);
      let test_item = bf.base64Encode(bf.encrypt(TEST_ITEM));

      localStorage.setItem(TEST_ITEM_KEY, test_item);
    }
  }
}

export namespace UserService {
  export enum unlock_return {
    WRONG,
    CORRECT,
    MAX_TRIES,
    ERROR
  }
}