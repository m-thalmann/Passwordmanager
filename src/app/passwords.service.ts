import { Injectable } from '@angular/core';
import { ApiService, Password, PasswordDexie } from './api.service';
import { UserService } from './user.service';
import { Blowfish } from 'javascript-blowfish';
import { Md5Pipe } from './md5.pipe';
import { DexieService } from './dexie.service';

@Injectable({
  providedIn: 'root'
})
export class PasswordsService {
  passwords: Password[] = null;

  constructor(private api: ApiService, private user: UserService, private dexie: DexieService) { }

  async unlock(){
    if(!this.decrypted){
      let passwords: PasswordDexie[] = null;
      
      // TODO: check settings if always update / now update needed
      if(navigator.onLine && ((passwords = await this.dexie.getAll()).length == 0)){
        passwords = await this.api.loadPasswords();
        
        await this.dexie.updateCollection(passwords);
      }else{
        passwords = await this.dexie.getAll();
      }

      this.passwords = this.decryptCollection(passwords);
    }
  }

  get(){
    this.check_decrypted();

    return this.passwords;
  }

  async save(){
    try{
      let ret = this.encryptCollection(this.passwords);

      console.log("save: ", ret);
    }catch(e){
      throw e;
    }
  }

  update(password: Password){
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

    password.enc_key = new Md5Pipe().transform((Math.pow(Math.random() * 100, 10)).toString() + date);
    password.last_changed = date;

    let index = password.id != -1 ? this.passwords.map(pw => pw.id).indexOf(password.id) : -1;

    if(index >= 0){
      this.passwords[index] = password;
    }else{ // TODO: 
      index = password._id ? this.passwords.map(pw => pw._id).indexOf(password._id): -1;

      if(index >= 0){
        this.passwords[index] = password;
      }else{
        this.passwords.push(password);
      }
    }

    return this.dexie.update(this.encrypt(password));
    // TODO: check if always sync --> then sync
  }

  remove(password: Password){
    // TODO: 
    // TODO: save db
    // TODO: check if always sync --> then sync
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

  private decryptCollection(passwords: PasswordDexie[]){
    return passwords.map(el => this.decrypt(el));
  }

  private decrypt(password: PasswordDexie){
    let element: Password = {
      id: password.id,
      enc_key: null,
      last_changed: password.last_changed,
      data: null,
      tags: password.tags
    };

    let bf = new Blowfish(this.user.password);

    element.enc_key = bf.trimZeros(bf.decrypt(bf.base64Decode(password.enc_key)));

    bf = new Blowfish(element.enc_key);

    element.data = JSON.parse(bf.trimZeros(bf.decrypt(bf.base64Decode(password.data))));

    return element;
  }

  private encryptCollection(passwords: Password[]) {
    return passwords.map(el => this.encrypt(el));
  }

  private encrypt(password: Password){
    let element: PasswordDexie = {
      id: password.id,
      enc_key: null,
      last_changed: password.last_changed,
      data: null,
      tags: password.tags
    };

    if (password._id) {
      element._id = password._id;
    }

    let bf = new Blowfish(password.enc_key);

    element.data = bf.base64Encode(bf.encrypt(JSON.stringify(password.data)));

    bf = new Blowfish(this.user.password);

    element.enc_key = bf.base64Encode(bf.encrypt(password.enc_key));

    return element;
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
