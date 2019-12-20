import {createDefaultConfig} from "../config";

/***********************
 * @author Jo.gel
 * @date 2019/12/19 0019
 * @process doing~
 ***********************/
import {ioControllerT, ioControllerDataSourceT, ioControllerConfigT} from '../d.ts/flv'
// import {SPEED_NORMALIZE_LIST} from '../config'
import Log from '../utils/logger'
import SpeedSampler from './speed-sampler'
import RangeLoader from './xhr-range-loader';
import RangeSeekHandler from './range-seek-handler'
import ParamSeekHandler from './param-seek-handler'
import WebSocketLoader from './websocket-loader'
import FetchStreamLoader from './fetch-stream-loader'
import MozChunkedLoader from './xhr-moz-chunked-loader'
import {RuntimeException, IllegalStateException, InvalidArgumentException} from "../utils/exception";
import {LoaderError} from "./loader";

class IOController {
    private readonly TAG: string;
    private readonly _config: any;
    private _loader: any;
    private _extraData: any;
    private readonly _stashInitialSize: number;
    private _stashUsed: number;
    private _stashSize: number;
    private _bufferSize: number;
    private _stashBuffer: ArrayBuffer;
    private _stashBytesStart: number;
    private _enableStash: boolean;
    private _loaderClass: any;
    private readonly _isWebSocketURL: any;
    private _dataSource: ioControllerDataSourceT;
    private _seekHandler: any;
    private readonly _refTotalLength: number;
    private _totalLength: number;
    private _fullRequestFlag: boolean;
    private _currentRange: any;
    private _redirectedURL: string | null;
    private _speedNormalized: number;
    private _speedSampler: SpeedSampler;
    private readonly _speedNormalizeList: number[];
    private _isEarlyEofReconnecting: boolean;
    private _onRecoveredEarlyEof: any | null;
    private _onRedirect: any;
    private _onComplete: any;
    private _onError: any;
    private _paused: boolean;
    private _onSeeked: any;
    private _onDataArrival: any;
    private _resumeFrom: number;

    constructor(dataSource: ioControllerDataSourceT, config: ioControllerConfigT, extraData?: any) {
        this.TAG = 'IOController';
        this._config = config;
        this._extraData = extraData;

        this._stashInitialSize = 1024 * 384; // 默认初始化尺寸384kb
        if (config.stashInitialSize !== undefined && config.stashInitialSize > 0) {
            // 应用config
            this._stashInitialSize = config.stashInitialSize
        }
        this._stashUsed = 0;
        this._stashSize = this._stashInitialSize;
        this._bufferSize = 1024 * 1024 * 3;   //初始化大小:3MB
        this._stashBuffer = new ArrayBuffer(this._bufferSize);
        this._stashBytesStart = 0;

        this._enableStash = config.enableStashBuffer !== false;

        this._loader = null;
        this._loaderClass = null;
        this._seekHandler = null;

        this._dataSource = dataSource;
        this._isWebSocketURL = /wss?:\/\/(.+?)/.test(dataSource.url);
        this._refTotalLength = dataSource.filesize ? dataSource.filesize : null;
        this._totalLength = this._refTotalLength;
        this._fullRequestFlag = false;
        this._currentRange = null;
        this._redirectedURL = null;

        this._speedNormalized = 0;
        this._speedSampler = new SpeedSampler();
        this._speedNormalizeList = [64, 128, 256, 384, 512, 768, 1024, 1536, 2048, 3072, 4096];

        this._isEarlyEofReconnecting = false;

        this._paused = false;
        this._resumeFrom = 0;

        this._onDataArrival = null;
        this._onSeeked = null;
        this._onError = null;
        this._onComplete = null;
        this._onRedirect = null;
        this._onRecoveredEarlyEof = null;

        this._selectSeekHandler();
        this._selectLoader();
        this._createLoader()

    }

    /* ********* 使用getter setting 属性拦截*********** */
    get status() {
        return this._loader.status
    }

    get extraData() {
        return this._extraData
    }

    set extraData(data) {
        this._extraData = data
    }

    // todo 下面几个拦截还要改动，好奇怪~~~
    // prototype: function onDataArrival(chunks: ArrayBuffer, byteStart: number): number
    get onDataArrival() {
        return this._onDataArrival
    }

    set onDataArrival(callback) {
        this._onDataArrival = callback
    }

    get onSeeked() {
        return this._onSeeked
    }

    set onSeeked(callback) {
        this._onSeeked = callback
    }

    // prototype: function onError(type: number, info: {code: number, msg: string}): void
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

    get onRedirect() {
        return this._onRedirect
    }

    set onRedirect(callback) {
        this._onRedirect = callback
    }

    get onRecoveredEarlyEof() {
        return this._onRecoveredEarlyEof
    }

    set onRecoveredEarlyEof(callback) {
        this._onRecoveredEarlyEof = callback
    }

    get currentURL() {
        return this._dataSource.url
    }

    get hasRedirect() {
        return (this._redirectedURL !== null || this._dataSource.redirectedURL !== undefined)
    }

    get currentRedirectedURL() {
        return this._redirectedURL || this._dataSource.redirectedURL
    }

    // in KB/s
    get currentSpeed() {
        if (this._loaderClass === RangeLoader) {
            // SpeedSampler is inaccuracy if loader is RangeLoader
            return this._loader.currentSpeed
        }
        return this._speedSampler.lastSecondKBps
    }

    get loaderType() {
        return this._loader.type
    }

    /* ********* 私有的方法 *************************** */

    private _selectSeekHandler() {
        const config = this._config;
        switch (config.seekType) {
            case 'range':
                this._seekHandler = new RangeSeekHandler(this._config.rangLoadZeroStart);
                break;
            case 'param':
                const paramStart = config.seekParamStart || 'bstart';
                const paramEnd = config.seekParamEnd || 'bend';
                this._seekHandler = new ParamSeekHandler(paramStart, paramEnd);
                break;
            case 'custom':
                if (typeof config.customSeekHandler !== 'function') {
                    throw new InvalidArgumentException('Custom seekType specified in config but invalid customSeekHandler!')
                }
                this._seekHandler = new config.customSeekHandler();
                break;
            default:
                throw new InvalidArgumentException(`Invalid seekType in config: ${config.seekType}`)
        }
    }

    /*
    * 当搜索请求来自媒体搜索时，应删除未使用的存储数据
    * 但是，如果从http重新连接中寻求请求，则不应删除存储数据
    *  @dropUnconsumed: 忽略并丢弃存储缓冲区中所有未使用的数据
    * */
    private _internalSeek(bytes: any, dropUnconsumed: boolean) {
        if (this._loader.isWorking()) {
            this._loader.abort()
        }
        // 搜索前（dispatch 和刷新）存储缓存区
        this._flushStashBuffer(dropUnconsumed);

        this._loader.destroy();
        this._loader = null;
        let requestRange = {from: bytes, to: -1};
        this._currentRange = {from: requestRange.from, to: -1};

        this._speedSampler.reset();
        this._stashSize = this._stashInitialSize;
        this._createLoader();
        this._loader.open(this._dataSource, requestRange); //todo

        if (this._onSeeked) {
            this._onSeeked()
        }
    }


    private _selectLoader() {
        if (this._config.customLoader != null) {
            this._loaderClass = this._config.customLoader
        } else if (this._isWebSocketURL) {
            this._loaderClass = WebSocketLoader
        } else if (FetchStreamLoader.isSupported()) {

        } else if (MozChunkedLoader.isSupported()) {

        } else if (RangeLoader.isSupport()) {
            this._loaderClass = RangeLoader
        } else {
            throw new RuntimeException('你的浏览器不支持xhr ArrayBuffer 的响应类型')
            // throw new RuntimeException('Your browser doesn\'t support xhr with arraybuffer responseType!');
        }
    }

    private _createLoader() {
        this._loader = new this._loaderClass(this._seekHandler, this._config);
        if (this._loader.needStashBuffer === false) {
            this._enableStash = false
        }
        this._loader.onContentLengthKnown = this._onContentLengthKnown.bind(this);
        this._loader.onURLRedirect = this._onURLRedirect.bind(this);
        this._loader.onDataArrival = this._onLoaderChunkArrival.bind(this);
        this._loader.onComplete = this._onLoaderComplete.bind(this);
        this._loader.onError = this._onLoaderError.bind(this)

    }

    private _expandBuffer(expectedBytes: number) {
        let bufferNewSize = this._stashSize;
        while (bufferNewSize + 1024 * 1024 < expectedBytes) {
            bufferNewSize *= 2
        }
        bufferNewSize += 1024 * 1024; // bufferSize=stashSize+1MB
        if (bufferNewSize === this._bufferSize) {
            return
        }
        let newBuffer = new ArrayBuffer(bufferNewSize);
        if (this._stashUsed > 0) {
            // copy 存在的数据到新的new buffer里去
            const stashOldArray = new Uint8Array(this._stashBuffer, 0, this._stashUsed);
            const stashNewArray = new Uint8Array(newBuffer, 0, bufferNewSize);
            stashNewArray.set(stashOldArray, 0)
        }
        this._stashBuffer = newBuffer;
        this._bufferSize = bufferNewSize
    }

    private _normalizeSpeed(input: number) {
        let list = this._speedNormalizeList;
        let last = list.length - 1;
        let mid = 0;
        let lbound = 0;
        let ubound = last;
        if (input < list[0]) {
            return list[0]
        }

        // 二进制搜索
        while (lbound < ubound) {
            mid = lbound + Math.floor((ubound - lbound) / 2);
            if (mid === last || (input >= list[mid] && input < list[mid + 1])) {
                return list[mid]
            } else if (list[mid] < input) {
                lbound = mid + 1
            } else {
                ubound = mid - 1
            }
        }
    }

    private _adjustStashSize(normalized: number) {
        let stashSizeKB = 0;
        // 如果是直播流
        if (this._config.isLive) {
            // live stream: always use single normalized speed for size of stashSizeKB
            stashSizeKB = normalized
        } else {
            if (normalized < 512) {
                stashSizeKB = normalized
            } else if (normalized >= 512 && normalized < 1024) {
                stashSizeKB = Math.floor(normalized * 1.5)
            } else {
                stashSizeKB = normalized * 2
            }
        }
        // 8MB，8K屏？
        if (stashSizeKB > 8192) {
            stashSizeKB = 8192
        }
        let bufferSize = stashSizeKB * 1024 + 1024 * 1024;   //stashSize+1MB
        if (this._bufferSize < bufferSize) {
            this._expandBuffer(bufferSize)
        }
        this._stashSize = stashSizeKB * 1024
    }

    private _dispatchChunks(chunks: any, byteStart: any) {
        this._currentRange.to = byteStart + chunks.byteLength - 1;
        return this._onDataArrival(chunks, byteStart)
    }

    private _onURLRedirect(redirectURL: string) {
        this._redirectedURL = redirectURL;
        if (this._onRedirect) {
            this._onRedirect(redirectURL)
        }

    }

    private _onContentLengthKnown(contentLength: any) {
        if (contentLength && this._fullRequestFlag) {
            this._totalLength = contentLength;
            this._fullRequestFlag = false
        }
    }

    private _onLoaderChunkArrival(chunk: any, byteStart: number, receiveLength: number) {
        if (!this._onDataArrival) {
            throw new IllegalStateException('IOController: No existing consumer (onDataArrival) callback!')
        }
        if (this._paused) {
            return
        }
        if (this._isEarlyEofReconnecting) {
            // 早期自动重新连接成功，通过回调通知上层
            this._isEarlyEofReconnecting = false;
            if (this._onRecoveredEarlyEof) {
                this._onRecoveredEarlyEof()
            }
        }
        this._speedSampler.addBytes(chunk.byteLength);

        // 根据网络速度动态调整存储缓冲区大小
        let KBps = this._speedSampler.lastSecondKBps;

        if (KBps !== 0) {
            let normalized = this._normalizeSpeed(KBps);
            if (this._speedNormalized !== normalized) {
                this._speedNormalized = normalized;
                this._adjustStashSize(normalized)
            }
        }

        // 禁用存储
        if (!this._enableStash) {
            if (this._stashUsed === 0) {
                // 直接将chunk 发送到消费者
                // 检查ret值（消耗的字节）并存储未消耗的两个stashBuffers
                let consumed = this._dispatchChunks(chunk, byteStart);
                // 未使用的数据仍然存在。
                if (consumed < chunk.byteLength) {
                    let remain = chunk.byteLength - consumed;
                    if (remain > this._bufferSize) {
                        this._expandBuffer(remain)
                    }
                    let stashArray = new Uint8Array(this._stashBuffer, 0, this._bufferSize);
                    stashArray.set(new Uint8Array(chunk, consumed), 0);
                    this._stashUsed += remain;
                    this._stashBytesStart = byteStart + consumed
                }
            } else {
                // 否则：将块合并到stashBuffer中，并将stashBuffer分派给使用者。
                if (this._stashUsed + chunk.byteLength > this._bufferSize) {
                    this._expandBuffer(this._stashUsed + chunk.byteLength)
                }
                let stashArray = new Uint8Array(this._stashBuffer, 0, this._bufferSize);
                stashArray.set(new Uint8Array(chunk), this._stashUsed);
                this._stashUsed += chunk.byteLength;

                let consumed = this._dispatchChunks(this._stashBuffer.slice(0, this._stashUsed), this._stashBytesStart);
                // 未使用的数据保留
                if (consumed < this._stashUsed && consumed > 0) {
                    let remainArray = new Uint8Array(this._stashBuffer, consumed);
                    stashArray.set(remainArray, 0)
                }
                this._stashUsed -= consumed;
                this._stashBytesStart += consumed
            }
        } else {
            // 启动存储
            if (this._stashUsed === 0 && this._stashBytesStart === 0) {
                // 寻找？还是初始块？
                // 这是seek操作之后的第一个块
                this._stashBytesStart = byteStart
            }
            if (this._stashUsed + chunk.byteLength <= this._stashSize) {
                // 只是储藏起来
                let stashArray = new Uint8Array(this._stashBuffer, 0, this._bufferSize);
                stashArray.set(new Uint8Array(chunk), this._stashUsed);
                this._stashUsed += chunk.byteLength
            } else {
                // stashUsed + chunkSize > stashSize, size limit exceeded，超出限制
                let stashArray = new Uint8Array(this._stashBuffer, 0, this._bufferSize);
                if (this._stashUsed > 0) {
                    // 缓冲区里有数据
                    // 调度整个stashBuffer，并保存剩余数据
                    // 然后将块追加到stashBuffer（stash）
                    let buffer = this._stashBuffer.slice(0, this._stashUsed);
                    let consumed = this._dispatchChunks(buffer, this._stashBytesStart);
                    if (consumed < buffer.byteLength) {
                        if (consumed > 0) {
                            let remainArray = new Uint8Array(buffer, consumed);
                            stashArray.set(remainArray, 0);
                            this._stashUsed = remainArray.byteLength;
                            this._stashBytesStart += consumed
                        }
                    } else {
                        this._stashUsed = 0;
                        this._stashBytesStart += consumed
                    }

                    if (this._stashUsed + chunk.byteLength > this._bufferSize) {
                        this._expandBuffer(this._stashUsed + chunk.byteLength);
                        stashArray = new Uint8Array(this._stashBuffer, 0, this._bufferSize)
                    }
                    stashArray.set(new Uint8Array(chunk), this._stashUsed);
                    this._stashUsed += chunk.byteLength
                } else {
                    // 存储缓冲区为空，但chunkSize> stashSize
                    // 直接分派数据块并保存剩余数据
                    let consumed = this._dispatchChunks(chunk, byteStart);
                    if (consumed < chunk.byteLength) {
                        let remain = chunk.byteLength - consumed;
                        if (remain > this._bufferSize) {
                            this._expandBuffer(remain);
                            stashArray = new Uint8Array(this._stashBuffer, 0, this._bufferSize)
                        }
                        stashArray.set(new Uint8Array(chunk, consumed), 0);
                        this._stashUsed += remain;
                        this._stashBytesStart = byteStart + consumed
                    }
                }
            }
        }

    }

    private _flushStashBuffer(dropUnconsumed: any): number {
        if (this._stashUsed > 0) {
            let buffer = this._stashBuffer.slice(0, this._stashUsed);
            let consumed = this._dispatchChunks(buffer, this._stashBytesStart);
            let remain = buffer.byteLength - consumed;

            if (consumed < buffer.byteLength) {
                if (dropUnconsumed) {
                    Log.w(this.TAG, `${remain} 刷新缓冲区时保留未使用的数据字节，已丢弃`)
                } else {
                    if (consumed > 0) {
                        let stashArray = new Uint8Array(this._stashBuffer, 0, this._bufferSize);
                        let remainArray = new Uint8Array(buffer, consumed);
                        stashArray.set(remainArray, 0);
                        this._stashUsed = remainArray.byteLength;
                        this._stashBytesStart += consumed
                    }
                    return 0
                }
            }
            this._stashUsed = 0;
            this._stashBytesStart = 0;
            return remain
        }
        return 0
    }

    private _onLoaderComplete(from: number, to: number) {
        // 强制刷新存储缓冲区，并删除未使用的数据
        this._flushStashBuffer(true);
        if (this._onComplete) {
            this._onComplete(this._extraData)
        }
    }

    private _onLoaderError(type: string, data: any) {
        Log.e(this.TAG, `加载错误，code=${data.code},msg=${data.msg}`);
        this._flushStashBuffer(false);

        if (this._isEarlyEofReconnecting) {
            // 为EarlyOf自动重新连接失败，向上层抛出不可恢复的EarlyOf错误
            this._isEarlyEofReconnecting = false;
            type = LoaderError.UNRECOVERABLE_EARLY_EOF
        }

        switch (type) {
            case LoaderError.EARLY_EOF:
                if (!this._config.isLive) {
                    // 如果不是直播流，则执行内部http重新连接
                    if (this._totalLength) {
                        let nextFrom = this._currentRange.to + 1;
                        if (nextFrom < this._totalLength) {
                            Log.w(this.TAG, '连接失败，尝试重新连接...');
                            this._isEarlyEofReconnecting = true;
                            this._internalSeek(nextFrom, false)
                        }
                        return
                    }
                    // 否则：我们不做知道长度，则抛出 UnrecoverableEarlyEof
                }
                // 直播流：向上层抛出不可恢复的早期错误
                type = LoaderError.UNRECOVERABLE_EARLY_EOF;
                break;
            case LoaderError.UNRECOVERABLE_EARLY_EOF:
            case LoaderError.CONNECTING_TIMEOUT:
            case LoaderError.HTTP_STATUS_CODE_INVALID:
            case LoaderError.EXCEPTION:
                break
        }
        if (this._onError) {
            this._onError(type, data)
        } else {
            throw new RuntimeException('IOException:' + data.msg)
        }
    }


    /* ********* 公开的方法 *************************** */

    /*
    * @desc 销毁实例
    * */
    destroy() {
        if (this._loader.isWorking()) {
            this._loader.abort()
        }
        this._loader.destroy();
        this._loader = null;
        this._loaderClass = null;
        this._dataSource = null;
        this._stashBuffer = null;
        this._stashUsed = this._stashSize = this._bufferSize = this._stashBytesStart = 0;
        this._currentRange = null;
        this._speedSampler = null;

        this._isEarlyEofReconnecting = false;

        this._onDataArrival = null;
        this._onSeeked = null;
        this._onSeeked = null;
        this._onError = null;
        this._onComplete = null;
        this._onRedirect = null;
        this._onRecoveredEarlyEof = null;

        this._extraData = null
    }

    /*
    * @desc 判断是否在工作中
    * */
    isWorking(): boolean {
        return this._loader && this._loader.isWorking() && !this._paused
    }

    /*
    * @desc 判断是否暂停
    * */
    isPaused() {
        return this._paused
    }


    open(optionalFrom: any) {
        this._currentRange = {from: 0, to: -1};
        if (optionalFrom) {
            this._currentRange.from = optionalFrom
        }
        this._speedSampler.reset();
        if (!optionalFrom) {
            this._fullRequestFlag = true
        }
        this._loader.open(this._dataSource, Object.assign({}, this._currentRange)) //todo
    }

    abort() {
        this._loader.abort();
        if (this._paused) {
            this._paused = false;
            this._resumeFrom = 0
        }
    }

    pause() {
        if (this.isWorking()) {
            this._loader.abort();
            if (this._stashUsed !== 0) {
                this._resumeFrom = this._stashBytesStart;
                this._currentRange.to = this._stashBytesStart - 1
            } else {
                this._resumeFrom = this._currentRange.to + 1
            }
            this._stashUsed = 0;
            this._stashBytesStart = 0;
            this._paused = true
        }
    }

    resume() {
        if (this._paused) {
            this._paused = false;
            let bytes = this._resumeFrom;
            this._resumeFrom = 0;
            this._internalSeek(bytes, true)
        }
    }

    seek(bytes: any) {
        this._paused = false;
        this._stashUsed = 0;
        this._stashBytesStart = 0;
        this._internalSeek(bytes, true)
    }

    updateUrl(url: string) {
        if (!url || typeof url !== "string" || url.length == 0) {
            throw new InvalidArgumentException('URL 是不为空的字符串')
        }
        this._dataSource.url = url
        // TODO: 替换为新的url
    }
}

export default IOController
