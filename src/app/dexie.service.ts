import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { PasswordDexie } from './api.service';

const DB_NAME = 'Passwordmanager';

@Injectable({
  providedIn: 'root'
})
export class DexieService extends Dexie {
  private passwords: Dexie.Table<PasswordDexie, number>;

  private constructor() {
    super(DB_NAME);

    this.version(1).stores({
      passwords: '++_id,id,enc_key,data,last_changed,tags'
    });
  }

  async getAll(){
    return await this.passwords.toArray();
  }

  async get(_id: number){
    let ret = await this.passwords.where('_id').equals(_id).toArray();

    if(ret.length == 1){
      return ret;
    }else{
      return null;
    }
  }

  /**
   * @returns _id of entries in db (array)
   */
  async updateCollection(passwords: PasswordDexie[]){
    let prms = [];
    passwords.forEach(async pw => {
      prms.push(this.update(pw));
    });

    return await Promise.all(prms);
  }

  /**
   * @returns _id of entry in db
   */
  async update(password: PasswordDexie){
    let pw_id = password.id != -1 ? await this.passwords.where('id').equals(password.id).toArray() : [];

    if(pw_id.length == 1){
      password._id = pw_id[0]._id;

      await this.passwords.where('id').equals(password.id).modify(password);

      return pw_id[0]._id;
    }else if(password._id && (await this.passwords.where('_id').equals(password._id).count()) > 0){
      await this.passwords.where('_id').equals(password._id).modify(password);
      return password._id;
    }else{
      return await this.passwords.add(password);
    }
  }

  /**
   * @returns amount of deleted passwords
   */
  async remove(_id: number){
    return await this.passwords.where('_id').equals(_id).delete;
  }

  async clear(){
    await this.passwords.clear();
  }
}
