// import FlvTS from '../d.ts/flv'
import {NotImplementedException} from "../utils/exception";

export const LoaderStatus = {
    kIdle: 0,
    kConnecting: 1,
    kBuffering: 2,
    kError: 3,
    kComplete: 4
};

export const LoaderError = {
    OK: 'OK',
    EXCEPTION: "Exception",                                  // 异常
    HTTP_STATUS_CODE_INVALID: "HttpStatusCodeInvalid",       // http status code 无效
    CONNECTING_TIMEOUT: "ConnectingTimeout",                 // 连接超时
    EARLY_EOF: "EarlyEof",                                   // 早期
    UNRECOVERABLE_EARLY_EOF: 'UnrecoverableEarlyEof'         // 无法恢复早期
};


/**
 * Loader 具有回调，回调有以下原型
 * function onContentLengthKnown(connectLength:number):void
 * function onURLRedirect(url:string):void
 * function onDataArrival(chunk:ArrayBufer,byteStart:number,receivedLength:number):void
 * function onError(errorType:number,errorInfo:{code:number,msg:string}):void
 * function onComplete(rangeFrom:number,rangeTo:number):void
 * @protected 受保护的关键字，可以在派生类中访问，意思是被作为父类被访问，被子类继承
 * @private 不能在它的类外部访问
 * @super 执行父类的constructor
 */
export class BaseLoader {
    protected _onError: any;
    protected _status: number;
    protected _onComplete: any;
    protected _onDataArrival: any;
    protected _needStash: boolean;
    private _onURLRedirect: null;
    private _onContentLengthKnown: any;
    private readonly _type: string;

    constructor(typeName: string | undefined) {
        this._type = typeName || 'undefined';
        this._status = LoaderStatus.kIdle;
        this._needStash = false;

        // 回调
        this._onContentLengthKnown = null;
        this._onURLRedirect = null;
        this._onDataArrival = null;
        this._onError = null;
        this._onComplete = null
    }

    /******************* 拦截 method ************************/
    get type() {
        return this._type
    }

    get status() {
        return this._status
    }

    get needStashBuffer() {
        return this._needStash
    }

    get onContentLengthKnown() {
        return this._onContentLengthKnown
    }

    set onContentLengthKnown(callback: any) {
        this._onContentLengthKnown = callback
    }

    get onURLRedirect() {
        return this._onURLRedirect
    }

    set onURLRedirect(callback: any) {
        this._onURLRedirect = callback
    }

    get onDataArrival() {
        return this._onDataArrival
    }

    set onDataArrival(callback: any) {
        this._onDataArrival = callback
    }

    get onError() {
        return this._onError
    }

    set onError(callback) {
        this._onError = callback
    }

    get onComplete() {
        return this._onComplete
    }

    set onComplete(callback) {
        this._onComplete = callback
    }

    /******************* Public method ************************/
    isWorking() {
        return this._status === LoaderStatus.kConnecting || this._status === LoaderStatus.kBuffering
    }

    destroy() {

    }

    // 纯虚拟
    open(dataSource: any, range: any) {
        // 尚未实现的函数
        throw new NotImplementedException()
    }

    abort() {
        throw new NotImplementedException()
    }

    /******************* private method ************************/
}
