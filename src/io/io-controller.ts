import {createDefaultConfig} from "../config";

/***********************
 * @author Jo.gel
 * @date 2019/12/19 0019
 * @process doing~
 ***********************/
import {ioControllerT, ioControllerDataSourceT, ioControllerConfigT} from '../d.ts/flv'
// import {SPEED_NORMALIZE_LIST} from '../config'
// IOController:ioControllerT;
import SpeedSampler from './speed-sampler'
import RangeLoader from './xhr-range-loader.js';

class IOController {
    private TAG: string;
    private _config: any;
    private _loader: any;
    private _extraData: any;
    private readonly _stashInitialSize: number;
    private _stashUsed: number;
    private _stashSize: number;
    private _bufferSize: number;
    private _stashBuffer: ArrayBuffer;
    private _stashBytesStart: number;
    private _enableStash: boolean;
    private _loaderClass: null;
    private _isWebSocketURL: any;
    private _dataSource: ioControllerDataSourceT;
    private _seekHandler: null;
    private readonly _refTotalLength: number;
    private _totalLength: number;
    private _fullRequestFlag: boolean;
    private _currentRange: null;
    private _redirectedURL: null;
    private _speedNormalized: number;
    private _speedSampler: SpeedSampler;
    private _speedNormalizeList: number[];
    private _isEarlyEofReconnecting: boolean;
    private _onRecoveredEarlyEof: null;
    private _onRedirect: null;
    private _onComplete: null;
    private _onError: null;
    private _paused: boolean;
    private _onSeeked: null;
    private _onDataArrival: null;
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

    }


    private _internalSeek() {

    }

    private _selectedLoader() {

    }


    private _selectLoader() {

    }

    private _createLoader() {

    }

    private _expandBuffer() {

    }

    private _normalizeSpeed() {

    }

    private _adjustStashSize() {

    }

    private _dispatchChunks() {

    }

    private _onURLRedirect() {

    }

    private _onContentLengthKnown() {

    }

    private _onLoaderChunkArrival() {

    }

    private _flushStashBuffer() {

    }

    private _onLoaderComplete() {

    }

    private _onLoaderError() {

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

    }

    abort() {

    }

    pause() {

    }

    resume() {

    }

    seek() {

    }

    updateUrl() {

    }
}

export default IOController
