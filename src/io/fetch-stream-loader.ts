/***********************
 * @name TS
 * @author Jo.gel
 * @date 2019/12/20 0020
 ***********************/

/*
* @desc 获取+流IO加载程序。目前仅在Chrome43+上工作
* fetch为XMLHttpRequest提供了更好的替代http API
*
* fetch spec   https://fetch.spec.whatwg.org/
* stream spec  https://streams.spec.whatwg.org/
* @static 这里是干嘛的？？
* */
import {BaseLoader, LoaderErrors, LoaderStatus} from "./loader";
import {RuntimeException} from "../utils/exception";
import Browser from '../utils/browser'

class FetchStreamLoader extends BaseLoader {
    private TAG: string;
    private _config: any;
    private _requestAbort: boolean;
    private readonly _contentLength: number | null;
    private _receivedLength: number;
    private _range: any;

    static isSupported() {
        const w: any = this;
        try {
            // fetch + stream is broken on Microsoft Edge. Disable before build 15048.
            // see https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8196907/
            // Fixed in Jan 10, 2017. Build 15048+ removed from blacklist.
            const isWorkWellEdge = Browser.msedge && Browser.version.minor > 15048;
            const browserNotBlacklisted = Browser.msedge ? isWorkWellEdge : true;
            return (w.fetch && w.ReadableStream && browserNotBlacklisted)
        } catch (e) {
            return false
        }
    }

    constructor(seekHandler: any, config: any) {
        super('fetch-stream-loader');
        this.TAG = 'FetchStreamLoader';
        this._config = config;
        this._needStash = true;
        this._range = null;
        this._requestAbort = false;
        this._contentLength = null;
        this._receivedLength = 0
    }

    /**************** Public Methods **********************/

    destroy() {
        if (this.isWorking()) {
            this.abort()
        }
        super.destroy();
    }

    // todo
    open(dataSource: any, range: any) {
        // super.open(dataSource, range);
    }

    abort() {
        this._requestAbort = true
    }

    /**************** private Methods **********************/

    /*
    * @desc 可读流阅读器
    * */
    _pump(reader: any) {
        return reader.read()
            .then((res: any) => {
                if (res.done) {
                    // 第一次检查接收长度
                    if (this._contentLength !== null && this._receivedLength < this._contentLength) {
                        // Report Early-EOF
                        this._status = LoaderStatus.kError;
                        const type = LoaderErrors.EARLY_EOF;
                        const info = {code: -1, msg: 'Fetch stream meet Early-EOF'};

                        if (this._onError) {
                            this._onError(type, info)
                        } else {
                            throw new RuntimeException(info.msg)
                        }
                    } else {
                        // OK，下载完成
                        this._status = LoaderStatus.kComplete;
                        if (this._onComplete) {
                            this._onComplete(this._range.from, this._range.from + this._receivedLength - 1)
                        }
                    }
                } else {
                    if (this._requestAbort === true) {
                        this._requestAbort = false;
                        this._status = LoaderStatus.kComplete;
                        return reader.cancel()
                    }
                    this._status = LoaderStatus.kBuffering;
                    let chunk = res.value.buffer;
                    let byteStart = this._range.from + this._receivedLength;
                    this._receivedLength += chunk.byteLength;
                    if (this._onDataArrival) {
                        this._onDataArrival(chunk, byteStart, this._receivedLength)
                    }
                    this._pump(reader)
                }
            })
            .catch((err: any) => {

                if (err.code === 11 && Browser.msedge) {
                    // InvalidStateError on Microsoft Edge
                    // Workaround: Edge may throw InvalidStateError after ReadableStreamReader.cancel() call
                    // Ignore the unknown exception.
                    // Related issue: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11265202/
                    return
                }
                this._status = LoaderStatus.kError;
                let type: number | string = 0;
                let info = null;

                // 网络错误
                if ((err.code === 19 || err.message === 'network error') && (this._contentLength === null || (this._receivedLength < this._contentLength))) {
                    type = LoaderErrors.EARLY_EOF;
                    info = {code: err.code, msg: 'Fetch stream meet Early-EOF'}
                } else {
                    type = LoaderErrors.EXCEPTION;
                    info = {code: err.code, msg: err.message}
                }
                if (this._onError) {
                    this._onError(type, info)
                } else {
                    throw new RuntimeException(info.msg)
                }
            })
    }
}

export default FetchStreamLoader
