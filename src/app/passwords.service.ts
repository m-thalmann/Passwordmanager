import { Injectable, EventEmitter } from '@angular/core';
import { ApiService, Password, PasswordDexie, Settings } from './api.service';
import { UserService } from './user.service';
import { Blowfish } from 'javascript-blowfish';
import { Md5Pipe } from './md5.pipe';
import { DexieService } from './dexie.service';
import { SyncModeService } from './sync-mode.service';
import { StorageVars } from './storage_vars';

@Injectable({
  providedIn: 'root'
})
export class PasswordsService {
  passwords: Password[] = null;

  private update_emitter = new EventEmitter<Password[]>();

  constructor(private api: ApiService, private user: UserService, private dexie: DexieService, private syncMode: SyncModeService) { }

  lock(){
    if(this.decrypted){
      this.passwords = null;
      this.update_emitter.emit(null);
      this.user.lock();
    }
  }

  async unlock(){
    if(!this.decrypted){
      let passwords: PasswordDexie[] = null;
      
      if(navigator.onLine && this.syncMode.mode == this.syncMode.modes.automatically){
        passwords = await this.load();
      }else{
        passwords = await this.dexie.getAll();
      }

      this.passwords = this.decryptCollection(passwords, this.user.password);
      this.update_emitter.emit(this.passwords);
    }
  }

  private async reloadDB(){
    this.passwords = this.decryptCollection(await this.dexie.getAll(), this.user.password);
    this.update_emitter.emit(this.passwords);
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

  get snapshot(){
    this.check_decrypted();

    return this.passwords;
  }

  get(){
    this.check_decrypted();

    return this.update_emitter;
  }

  async save(){
    try{
      let ret = this.encryptCollection(this.passwords, this.user.password).map(pw => {
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

    let pw = this.encrypt(password, this.user.password);

    if(navigator.onLine && this.syncMode.mode == this.syncMode.modes.automatically){
      pw.id = await this.api.updatePassword(pw);
      password.id = pw.id;
    }

    let ret = this.dexie.update(pw);

    this.update_emitter.emit(this.passwords);

    return ret;
  }

  async remove(password: Password){
    if(password._id){
      await this.dexie.remove(password._id);
    }

    if(password.id == -1){
      return;
    }

    if(navigator.onLine && this.syncMode.mode == this.syncMode.modes.automatically){
      await this.api.deletePassword(password.id);
    }else{
      let dp = JSON.parse(localStorage.getItem(StorageVars.DELETED_PASSWORDS));

      dp = dp ? dp : [];
      
      if(dp.indexOf(password.id) == -1){
        dp.push(password.id);
        localStorage.setItem(StorageVars.DELETED_PASSWORDS, JSON.stringify(dp));
      }
    }

    await this.reloadDB();
  }

  async removeAll(){
    await this.unlock();
    
    if(navigator.onLine && this.syncMode.mode == this.syncMode.modes.automatically){
      await this.api.deleteAllPasswords();
    }else{
      let dp = JSON.parse(localStorage.getItem(StorageVars.DELETED_PASSWORDS));

      dp = dp ? dp : [];

      this.passwords.forEach(pw => {
        if(dp.indexOf(pw.id) == -1){
          dp.push(pw.id);
        }
      });

      localStorage.setItem(StorageVars.DELETED_PASSWORDS, JSON.stringify(dp));
    }

    await this.dexie.clear();

    await this.reloadDB();
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

  decryptCollection(passwords: PasswordDexie[], pw: string){
    return passwords.map(el => this.decrypt(el, pw));
  }

  decrypt(password: PasswordDexie, pw: string){
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

    let bf = new Blowfish(pw);

    element.enc_key = bf.trimZeros(bf.decrypt(bf.base64Decode(password.enc_key)));

    bf = new Blowfish(element.enc_key);

    element.data = JSON.parse(bf.trimZeros(bf.decrypt(bf.base64Decode(password.data))));

    return element;
  }

  encryptCollection(passwords: Password[], pw: string) {
    return passwords.map(el => this.encrypt(el, pw));
  }

  encrypt(password: Password, pw: string){
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

    bf = new Blowfish(pw);

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

      if(password && Date.parse(header.last_changed) < Date.parse(password.last_changed)){
        toSync.push(password);
      }
    });

    if(toSync.length > 0){
      let encSync = this.encryptCollection(toSync, this.user.password);
  
      await this.api.updatePasswords(encSync);
    }

    let dp = JSON.parse(localStorage.getItem(StorageVars.DELETED_PASSWORDS));

    dp = dp ? dp : [];

    let prms = [];

    dp.forEach((id: number) => {
      prms.push(this.api.deletePassword(id));
    });

    await Promise.all(prms);

    localStorage.removeItem(StorageVars.DELETED_PASSWORDS);

    this.passwords = this.decryptCollection(await this.load(), this.user.password);

    this.update_emitter.emit(this.passwords);
  }

  async newMasterPassword(pw: string){
    await this.sync();

    let ret = this.encryptCollection(this.passwords, pw);

    await this.api.updatePasswords(ret);
  }

  async change_user_settings(settings: Settings){
    if(settings.password){
      settings.password = new Md5Pipe().transform(settings.password);
      await this.newMasterPassword(settings.password);
    }

    await this.api.updateSettings(settings);
  }

  static search(passwords: Password[], text: string){
    if(text == null || text.trim().length == 0){
      return passwords;
    }

    return passwords.filter(pword => {
      let ret = pword.tags.some(tag => {
        return tag.indexOf(text) != -1;
      });

      if(!ret && pword.data.name){
        ret = pword.data.name.indexOf(text) != -1;
      }

      if(!ret && pword.data.username){
        ret = pword.data.username.indexOf(text) != -1;
      }

      if(!ret && pword.data.domain){
        ret = pword.data.domain.indexOf(text) != -1;
      }

      if(!ret && pword.data.additional_data){
        ret = pword.data.additional_data.some(data => {
          return data.name.indexOf(text) != -1 || data.value.indexOf(text) != -1;
        });
      }

      return ret;
    });
  }
}
