import { Injectable } from '@angular/core';
import { ApiService, Password, PasswordAPI } from './api.service';
import { UserService } from './user.service';
import { Blowfish } from 'javascript-blowfish';
import { Md5Pipe } from './md5.pipe';

@Injectable({
  providedIn: 'root'
})
export class PasswordsService {
  passwords: Password[] = null;

  constructor(private api: ApiService, private user: UserService) { }

  async unlock(){
    if(!this.decrypted)
      this.decrypt(await this.api.loadPasswords());
  }

  get(){
    this.check_decrypted();

    return this.passwords;
  }

  async save(){
    try{
      let ret = this.encrypt();

      console.log("save: ", ret);
    }catch(e){
      throw e;
    }
  }

  add(data: any, tags: string[] = []){
    this.check_decrypted();

    let today: Date = new Date();

    let year = today.getFullYear();
    let month = today.getMonth()+1;
    let day = today.getDate();

    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();

    let date: string = this.padZero(year.toString(), 2) + '-' + this.padZero(month.toString(), 2) + '-' + this.padZero(day.toString(), 2)
                          + ' ' + this.padZero(hours.toString(), 2) + ':' + this.padZero(minutes.toString(), 2) + ':' + this.padZero(seconds.toString(), 2);

    this.passwords.push({
      id: -1,
      enc_key: new Md5Pipe().transform((Math.pow(Math.random() * 100, 10)).toString() + date),
      data: data,
      last_changed: date,
      tags: tags
    });
  }

  private check_decrypted(should_be: boolean = true){
    if(this.decrypted && !should_be){
      throw 'Already decrypted';
    }else if(!this.decrypted && should_be){
      throw 'No decrypted passwords found';
    }
  }

  get decrypted(){
    return this.passwords != null;
  }

  private decrypt(passwords: PasswordAPI[]){
    if(this.decrypted)
      return;

    let ret = passwords.map(el => {
      let bf = new Blowfish(this.user.password);

      el.enc_key = bf.trimZeros(bf.decrypt(bf.base64Decode(el.enc_key)));

      bf = new Blowfish(el.enc_key);

      el.data = JSON.parse(bf.trimZeros(bf.decrypt(bf.base64Decode(el.data))));

      return el as Password;
    });

    this.passwords = ret;
  }

  private encrypt(){
    // TODO: test
    this.check_decrypted();

    return this.passwords.map(el => {
      let element: PasswordAPI = {
        id: el.id,
        enc_key: el.enc_key,
        last_changed: el.last_changed,
        data: null,
        tags: el.tags
      };

      let bf = new Blowfish(el.enc_key);

      element.data = bf.base64Encode(bf.encrypt(JSON.stringify(el.data)));
      
      bf = new Blowfish(this.user.password);
      
      element.enc_key = bf.base64Encode(bf.encrypt(el.enc_key));

      return element;
    });
  }

  private get_storage(){

  }

  private padZero(str: string, length: number, before: boolean = true){
    if(str.length < length){
      if(before){
        let ret = '';
        while(str.length + ret.length < length){
          ret += '0';
        }
        return ret + str;
      }else{
        let ret = str;
        while(ret.length < length){
          ret += '0';
        }
        return ret;
      }
    }

    return str;
  }
}
