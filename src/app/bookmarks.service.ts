import { Injectable, EventEmitter } from '@angular/core';
import { StorageVars } from './storage_vars';

@Injectable({
  providedIn: 'root'
})
export class BookmarksService {
  changes = new EventEmitter<void>(); 

  constructor() { }

  get(){
    let ret = JSON.parse(localStorage.getItem(StorageVars.BOOKMARKS));
    return ret ? ret : [];
  }

  add(_id: number){
    let ret = this.get();

    if(ret.indexOf(_id) == -1){
      ret.push(_id);
      
      localStorage.setItem(StorageVars.BOOKMARKS, JSON.stringify(ret));
      this.changes.emit();
    }
  }

  remove(_id: number){
    let bm: number[] = this.get();
    let pos = bm.indexOf(_id);

    if(pos != -1){
      bm.splice(pos, 1);

      localStorage.setItem(StorageVars.BOOKMARKS, JSON.stringify(bm));
      this.changes.emit();
    }
  }

  toggle(_id: number){
    if(this.is(_id)){
      this.remove(_id);
    }else{
      this.add(_id);
    }
  }

  is(_id: number){
    return this.get().indexOf(_id) != -1;
  }
}
