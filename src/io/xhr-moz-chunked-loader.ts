/***********************
 * @name TS
 * @author Jo.gel
 * @date 2019/12/20 0020
 ***********************/
import {BaseLoader} from "./loader";
import Log from '../utils/logger'

class MozChunkedLoader extends BaseLoader {
    static isSupported() {
        try {
            let xhr: any = new XMLHttpRequest();
            // Firefox 37- requires .open() to be called before setting responseType
            xhr.open('GET', 'http://example.com', true);
            xhr.responseType = 'moz-chunked-arraybuffer';
            return (xhr.responseType === 'moz-chunked-arraybuffer')
        } catch (e) {
            Log.w('MozChunkedLoader', e.message);
            return false
        }
    }
}

export default MozChunkedLoader
