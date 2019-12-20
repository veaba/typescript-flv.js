/***********************
 * @author Jo.gel
 * @date 2019/12/20 0020
 ***********************/

/* Notice: ms-stream may cause IE/Edge browser crash if seek too frequently!!!
 * The browser may crash in wininet.dll. Disable for now.
 *
 * For IE11/Edge browser by microsoft which supports `xhr.responseType = 'ms-stream'`
 * Notice that ms-stream API sucks. The buffer is always expanding along with downloading.
 *
 * We need to abort the xhr if buffer size exceeded limit size (e.g. 16 MiB), then do reconnect.
 * in order to release previous ArrayBuffer to avoid memory leak
 *
 * Otherwise, the ArrayBuffer will increase to a terrible size that equals final file size.
 */

import {BaseLoader, LoaderStatus, LoaderErrors} from "./loader";
import Log from "../utils/logger";
import {RuntimeException} from "../utils/exception";

class MSStreamLoader extends BaseLoader {
    private TAG: string;
    private _seekHandler: any;
    private _config: any;
    private _xhr: any;
    private _reader: any;
    private _totalRange: any;
    private _currentRange: null;
    private _currentRequestURL: null;
    private _contentLength: number | null;
    private _receivedLength: number;
    private _currentRedirectedURL: string | null;
    private _bufferLimit: number;
    private _isReconnecting: boolean;
    private _dataSource: any;
    private _lastTimeBufferSize: number;


    static isSupported() {
        try {
            const w: any = self;
            if (typeof w.MSStream === 'undefined' || typeof w.MSStreamReader === 'undefined') {
                return false;
            }
            let xhr: any = new XMLHttpRequest();
            xhr.open('GET', 'https://example.com', true);
            xhr.responseType = 'ms-stream';
            return (xhr.responseType === 'ms-stream');
        } catch (e) {
            Log.w('MSStreamLoader', e.message);
            return false;
        }
    }

    constructor(seekHandler: any, config: any) {
        super('xhr-msstream-loader');
        this.TAG = 'MSStreamLoader';

        this._seekHandler = seekHandler;
        this._config = config;
        this._needStash = true;

        this._xhr = null;
        this._reader = null; //MSStreamReader

        this._totalRange = null;
        this._currentRange = null;

        this._currentRequestURL = null;
        this._currentRedirectedURL = null;

        this._contentLength = null;
        this._receivedLength = 0;

        this._bufferLimit = 10 * 1024 * 1024; //16MB
        this._lastTimeBufferSize = 0;
        this._isReconnecting = false

    }

    /* *************** public methods ****************** */
    destroy() {
        if (this.isWorking()) {
            this.abort()
        }
        if (this._reader) {
            this._reader.onprocess = null;
            this._reader.onload = null;
            this._reader.onerror = null;
            this._reader = null
        }
        if (this._xhr) {
            this._xhr.onreadystatechange = null;
            this._xhr = null
        }
        super.destroy();
    }

    open(dataSource: any, range: any) {
        this._internalOpen(dataSource, range, false)
    }

    abort() {
        this._internalAbort();
        this._status = LoaderStatus.kComplete
    }

    /* *************** private methods ****************** */
    _internalOpen(dataSource: any, range: any, isSubRange: any) {
        this._dataSource = dataSource;
        if (!isSubRange) {
            this._totalRange = range
        } else {
            this._currentRange = range
        }

        let sourceURL = dataSource.url;
        if (this._config.reuseRedirectedURL) {
            if (this._currentRequestURL !== undefined) {
                sourceURL = this._currentRedirectedURL
            } else if (dataSource.redirectedURL !== undefined) {
                sourceURL = dataSource.redirectedURL
            }
        }

        let seekConfig = this._seekHandler.getConfig(sourceURL, range);
        this._currentRequestURL = seekConfig.url;
        const w: any = self;
        let reader = this._reader = new w.MSStreamReader();
        reader.onprocess = this._msrOnProgress.bind(this);
        reader.onload = this._msrOnLoad.bind(this);
        reader.onerror = this._msrOnError.bind(this);

        let xhr: any = this._xhr = new XMLHttpRequest();
        xhr.open('GET', seekConfig.url, true);
        xhr.responseType = 'ms-stream';
        xhr.onreadystatechange = this._xhrOnReadyStateChange.bind(this);
        xhr.onerror = this._xhrOnError.bind(this);

        // 有凭据
        if (dataSource.withCredentials) {
            xhr.withCredentials = true
        }


        // 合并seekConfig.headers 和 this._config.header并将key写到xhr.setRequestHeader
        // 改写原来代码
        const mergeHeader = {...seekConfig.headers || {}, ...this._config.headers};
        for (let key in mergeHeader) {
            // 判断这个key 在自身的属性，存不存在，
            if (mergeHeader.hasOwnProperty(key)) {
                xhr.setRequestHeader(key, mergeHeader[key])
            }
        }
        // if (typeof seekConfig.headers === 'object') {
        //     let headers = seekConfig.headers;
        //
        //     for (let key in headers) {
        //         // 判断这个key 在自身的属性，存不存在，
        //         if (headers.hasOwnProperty(key)) {
        //             xhr.setRequestHeader(key, headers[key])
        //         }
        //     }
        // }
        //
        // // 添加其header
        // if(typeof this._config.headers==='object'){
        //     let headers =this._config.headers;
        //     for(let key in headers){
        //         if (headers.hasOwnProperty(key)) {
        //             xhr.setRequestHeader(key, headers[key]);
        //         }
        //     }
        // }

        if (this._isReconnecting) {
            this._isReconnecting = false
        } else {
            this._status = LoaderStatus.kConnecting
        }
        xhr.send()
    }

    _internalAbort() {
        if (this._reader) {
            // loading
            if (this._reader.readyState === 1) {
                this._reader.abort()
            }

            this._reader.onprogress = null;
            this._reader.onload = null;
            this._reader.onerror = null;
            this._reader = null
        }
        if (this._xhr) {
            this._xhr.abort();
            this._xhr.onreadystatechange = null;
            this._xhr = null
        }
    }

    _xhrOnReadyStateChange(e: any) {
        let xhr: any = e.target;

        if (xhr.readyState === 2) {
            if (xhr.status >= 200 && xhr.status <= 299) {
                this._status = LoaderStatus.kBuffering;

                if (xhr.responseURL !== undefined) {
                    let redirectURL = this._seekHandler.removeURLParameters(xhr.responseURL);
                    if (xhr.responseURL !== this._currentRequestURL && redirectURL !== this._currentRequestURL) {
                        this._currentRedirectedURL = redirectURL;
                        if (this._onURLRedirect) {
                            this._onURLRedirect(redirectURL)
                        }
                    }
                }

                let contentLength = xhr.getResponseHeader('Content-Length');
                if (contentLength !== null && this._contentLength == null) {
                    let length = parseInt(contentLength);
                    if (length) {
                        this._contentLength = length;
                        if (this._onContentLengthKnown) {
                            this.onContentLengthKnown(this._contentLength)
                        }
                    }
                }
            } else {
                this._status = LoaderStatus.kError;
                if (this._onError) {
                    this._onError(LoaderErrors.HTTP_STATUS_CODE_INVALID, {code: xhr.status, msg: xhr.statusText})
                } else {
                    throw new RuntimeException('MSStreamLoader: Http code invalid, ' + xhr.status + ' ' + xhr.statusText)
                }
            }
        } else if (xhr.readyState === 3) {
            // loading
            if (xhr.status >= 200 && xhr.status <= 299) {
                this._status = LoaderStatus.kBuffering;

                let msStream = xhr.response;
                this._reader.readAsArrayBuffer(msStream)
            }

        }
    }

    _xhrOnError(e: any) {
        this._status = LoaderStatus.kError;
        let type = LoaderErrors.EXCEPTION;
        const info = {code: -1, msg: e.constrictor.name + ' ' + e.type};

        if (this._onError) {
            this._onError(type, info)
        } else {
            throw new RuntimeException(info.msg)
        }
    }

    _msrOnProgress(e: any) {
        let render = e.target;
        let bigBuffer = render.result;

        // 结果可能为空，解决错误M$
        if (bigBuffer === null) {
            this._doReconnectIfNeeded();
            return
        }

        let slice = bigBuffer.slice(this._lastTimeBufferSize);
        this._lastTimeBufferSize = bigBuffer.byteLength;
        let byteStart = this._totalRange.from + this._receivedLength;
        this._receivedLength += slice.byteLength;

        if (this._onDataArrival) {
            this._onDataArrival(slice, byteStart, this._receivedLength)
        }

        if (bigBuffer.byteLength >= this._bufferLimit) {
            // MSStream buffer 最大值期待接近xx，重连
            Log.v(this.TAG, `MSStream buffer exceeded max size near ${byteStart + slice.byteLength}, reconnecting...`);
            this._doReconnectIfNeeded();
        }
    }

    _doReconnectIfNeeded() {
        if (this._contentLength === null || this._receivedLength < this._contentLength) {
            this._isReconnecting = true;
            this._lastTimeBufferSize = 0;
            this._internalAbort();

            const range = {
                from: this._totalRange.from + this._receivedLength,
                to: -1
            };
            this._internalOpen(this._dataSource, range, true)
        }
    }

    // 实际上是一个完整的事件
    _msrOnLoad(e: any) {
        this._status = LoaderStatus.kComplete;
        if (this._onComplete) {
            this._onComplete(this._totalRange.from, this._totalRange.from + this._receivedLength - 1)
        }
    }

    _msrOnError(e: any) {
        this._status = LoaderStatus.kError;
        let type = '';
        let info = null;

        if (this._contentLength && this._receivedLength < this._contentLength) {
            type = LoaderErrors.EARLY_EOF;
            info = {code: -1, msg: 'MSStream meet Early-Eof'}
        } else {
            type = LoaderErrors.EARLY_EOF;
            info = {code: -1, msg: e.constructor.name + ' ' + e.type}
        }
        if (this._onError) {
            this._onError(type, info)
        } else {
            throw new RuntimeException(info.msg)
        }
    }
}

export default MSStreamLoader
