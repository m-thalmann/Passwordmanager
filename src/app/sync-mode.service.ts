import { Injectable } from '@angular/core';
import { StorageVars } from './storage_vars';

@Injectable({
  providedIn: 'root'
})
export class SyncModeService {
  readonly modes = {
    automatically: "automatically",
    manually: "manually"
  };

  constructor() { }

  set mode(mode: string){
    if(!this.modes[mode]){
      throw "Mode not supportet";
    }
    localStorage.setItem(StorageVars.SYNC_MODE, mode);
  }

  get mode(){
    let ret = localStorage.getItem(StorageVars.SYNC_MODE);
    return ret ? ret : 'automatically';
  }
}
