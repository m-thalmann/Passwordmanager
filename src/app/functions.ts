export function copyToClipboard(item: string) {
    document.addEventListener('copy', (e: ClipboardEvent) => {
        e.clipboardData.setData('text/plain', (item));
        e.preventDefault();
        document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
}

/**
 * @author https://gist.github.com/nicbell/6081098
 */
export function deepEquals (obj1: any, obj2: any) {
    for (var p in obj1) {
        if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false;

        switch (typeof (obj1[p])) {
            case 'object':
                if (!deepEquals(obj1[p], obj2[p])) return false;
                break;
            case 'function':
                if (typeof (obj2[p]) == 'undefined' || (p != 'compare' && obj1[p].toString() != obj2[p].toString())) return false;
                break;
            default:
                if (obj1[p] != obj2[p]) return false;
        }
    }

    for (var p in obj2) {
        if (typeof (obj1[p]) == 'undefined') return false;
    }
    return true;
};

export function trimObject(object: object){
    for(let key in object){
      if(typeof object[key] === "string"){
        object[key] = object[key].trim();
      }

      if(object[key].length == 0){
        delete object[key];
      }
    }

    return object;
}