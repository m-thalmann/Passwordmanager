import { Injectable } from '@angular/core';

const SYNC_MODE = 'SYNC_MODE';

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
    localStorage.setItem(SYNC_MODE, mode);
  }

  get mode(){
    let ret = localStorage.getItem(SYNC_MODE);
    return ret ? ret : 'automatically';
  }
}
