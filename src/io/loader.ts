// import FlvTS from '../d.ts/flv'
export const LoaderStatus={
    kIdle:0,
    kConnecting:1,
    kBuffering:2,
    kError:3,
    kComplete:4
};

export const LoaderError={
    OK:'OK',
    EXCEPTION:"Exception",                                  // 异常
    HTTP_STATUS_CODE_INVALID:"HttpStatusCodeInvalid",       // http status code 无效
    CONNECTING_TIMEOUT:"ConnectingTimeout",                 // 连接超时
    EARLY_EOF:"EarlyEof",                                   // 早期
    UNRECOVERABLE_EARLY_EOF:'UnrecoverableEarlyEof'         // 无法恢复早期
};

/**
 * Loader 具有回调，回调有以下原型
 * function onContentLengthKnown(connectLength:number):void
 * function onURLRedirect(url:string):void
 * function onDataArrival(chunk:ArrayBufer,byteStart:number,receivedLength:number):void
 * function onError(errorType:number,errorInfo:{code:number,msg:string}):void
 * function onComplete(rangeFrom:number,rangeTo:number):void
 *
*/
export class BaseLoader{
    constructor(typeName:string|undefined){

    }
}
