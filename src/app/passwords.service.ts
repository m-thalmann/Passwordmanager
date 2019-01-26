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
      // TODO: check settings if always update / now update needed / online etc
      let passwords: PasswordDexie[] = null;
      if(false){
        passwords = await this.api.loadPasswords();
        
        await this.dexie.updateCollection(passwords);
      }else{
        passwords = await this.dexie.getAll();
      }

      this.decrypt(passwords);
    }
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

  private decrypt(passwords: PasswordDexie[]){
    if(this.decrypted)
      return;

    let ret = passwords.map(el => {
      let element: Password = {
        id: el.id,
        enc_key: null,
        last_changed: el.last_changed,
        data: null,
        tags: el.tags
      };

      let bf = new Blowfish(this.user.password);

      element.enc_key = bf.trimZeros(bf.decrypt(bf.base64Decode(el.enc_key)));

      bf = new Blowfish(element.enc_key);

      element.data = JSON.parse(bf.trimZeros(bf.decrypt(bf.base64Decode(el.data))));

      return element;
    });

    this.passwords = ret;
  }

  private encrypt(){
    // TODO: test
    this.check_decrypted();

    return this.passwords.map(el => {
      let element: PasswordDexie = {
        id: el.id,
        enc_key: null,
        last_changed: el.last_changed,
        data: null,
        tags: el.tags
      };

      if(el._id){
        element._id = el._id;
      }

      let bf = new Blowfish(el.enc_key);

      element.data = bf.base64Encode(bf.encrypt(JSON.stringify(el.data)));
      
      bf = new Blowfish(this.user.password);
      
      element.enc_key = bf.base64Encode(bf.encrypt(el.enc_key));

      return element;
    });
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
