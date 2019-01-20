import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'word'
})
export class WordPipe implements PipeTransform {

  transform(value: string) {
    return value.charAt(0).toUpperCase() + value.substring(1).toLowerCase();
  }

}
