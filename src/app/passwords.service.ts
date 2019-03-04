import { Injectable } from '@angular/core';
import { ApiService, Password, PasswordDexie } from './api.service';
import { UserService } from './user.service';
import { Blowfish } from 'javascript-blowfish';
import { Md5Pipe } from './md5.pipe';
import { DexieService } from './dexie.service';
import { SyncModeService } from './sync-mode.service';

@Injectable({
  providedIn: 'root'
})
export class PasswordsService {
  passwords: Password[] = null;

  constructor(private api: ApiService, private user: UserService, private dexie: DexieService, private syncMode: SyncModeService) { }

  async unlock(){
    if(!this.decrypted){
      let passwords: PasswordDexie[] = null;
      
      if(navigator.onLine && ((passwords = await this.dexie.getAll()).length == 0 || this.syncMode.mode == this.syncMode.modes.automatically)){
        passwords = await this.load();
      }else{
        passwords = await this.dexie.getAll();
      }

      this.passwords = this.decryptCollection(passwords);
    }
  }

  private async load(){
    let ids = (await this.dexie.getAll()).map(pw => { return { id: pw.id, _id: pw._id } }).filter(pw => pw.id != -1);

    let passwords = await this.api.loadPasswords();
        
    await this.dexie.updateCollection(passwords);

    let prms = [];

    ids.filter(id => passwords.map(pw => pw.id).indexOf(id.id) == -1).forEach(id => prms.push(this.dexie.remove(id._id)));

    await Promise.all(prms);

    return passwords;
  }

  get(){
    this.check_decrypted();

    return this.passwords;
  }

  async save(){
    try{
      let ret = this.encryptCollection(this.passwords).map(pw => {
        return this.dexie.update(pw);
      });

      await Promise.all(ret);
    }catch(e){
      throw e;
    }
  }

  async update(password: Password){
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
    }else{
      index = password._id ? this.passwords.map(pw => pw._id).indexOf(password._id): -1;

      if(index >= 0){
        this.passwords[index] = password;
      }else{
        this.passwords.push(password);
      }
    }

    let pw = this.encrypt(password);

    if(this.syncMode.mode == this.syncMode.modes.automatically){
      pw.id = await this.api.updatePassword(pw);
      password.id = pw.id;
    }

    return this.dexie.update(pw);
  }

  remove(password: Password){
    // TODO: implement remove
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

    if(password._id) {
      element._id = password._id;
    }

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

  async sync(){
    await this.unlock();

    let headers = await this.api.loadHeaders();

    let toSync = this.passwords.filter(pword => pword.id == -1);

    headers.forEach(header => {
      let password = this.passwords.filter(pword => pword.id == header.id)[0];

      if(Date.parse(header.last_changed) < Date.parse(password.last_changed)){
        toSync.push(password);
      }
    });

    let encSync = this.encryptCollection(toSync);

    await this.api.updatePasswords(encSync);

    this.passwords = this.decryptCollection(await this.load());
  }
}
