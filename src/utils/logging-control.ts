/***********************
 * @desc 改为class 继承
 * @author Jo.gel
 * @date 2019/12/20 0020
 ***********************/

import {EventEmitter} from 'events'
import Log from "./logger";

class LoggingControl extends Log {

    public emitter: any;

    constructor() {
        super();
        this.emitter = new EventEmitter();
    }


    static get forceGlobalTag() {
        return this.FORCE_GLOBAL_TAG
    }

    static set forceGlobalTag(enable) {
        this.FORCE_GLOBAL_TAG = enable;
        this._notifyChange()
    }

    static get globalTag() {
        return this.FORCE_GLOBAL_TAG
    }

    static set globalTag(tag: any) {
        this.GLOBAL_TAG = tag;
        this._notifyChange()
    }

    static get enableAll() {
        return this.ENABLE_VERBOSE
            && this.ENABLE_DEBUG
            && this.ENABLE_INFO
            && this.ENABLE_WARN
            && this.ENABLE_ERROR;
    }

    static set enableAll(enable) {
        this.ENABLE_VERBOSE = enable;
        this.ENABLE_DEBUG = enable;
        this.ENABLE_INFO = enable;
        this.ENABLE_WARN = enable;
        this.ENABLE_ERROR = enable;
        this._notifyChange();
    }


    static get enableDebug() {
        return this.ENABLE_DEBUG;
    }

    static set enableDebug(enable) {
        this.ENABLE_DEBUG = enable;
        this._notifyChange();
    }

    static get enableVerbose() {
        return this.ENABLE_VERBOSE;
    }

    static set enableVerbose(enable) {
        this.ENABLE_VERBOSE = enable;
        this._notifyChange();
    }

    static get enableInfo() {
        return this.ENABLE_INFO;
    }

    static set enableInfo(enable) {
        this.ENABLE_INFO = enable;
        this._notifyChange();
    }

    static get enableWarn() {
        return this.ENABLE_WARN;
    }

    static set enableWarn(enable) {
        this.ENABLE_WARN = enable;
        this._notifyChange();
    }

    static get enableError() {
        return this.ENABLE_ERROR;
    }

    static set enableError(enable) {
        this.ENABLE_ERROR = enable;
        this._notifyChange();
    }

    static getConfig() {
        return {
            globalTag: this.GLOBAL_TAG,
            forceGlobalTag: this.FORCE_GLOBAL_TAG,
            enableVerbose: this.ENABLE_VERBOSE,
            enableDebug: this.ENABLE_DEBUG,
            enableInfo: this.ENABLE_INFO,
            enableWarn: this.ENABLE_WARN,
            enableError: this.ENABLE_ERROR,
            enableCallback: this.ENABLE_CALLBACK
        };
    }

    static applyConfig(config: any) {
        this.GLOBAL_TAG = config.globalTag;
        this.FORCE_GLOBAL_TAG = config.forceGlobalTag;
        this.ENABLE_VERBOSE = config.enableVerbose;
        this.ENABLE_DEBUG = config.enableDebug;
        this.ENABLE_INFO = config.enableInfo;
        this.ENABLE_WARN = config.enableWarn;
        this.ENABLE_ERROR = config.enableError;
        this.ENABLE_CALLBACK = config.enableCallback;
    }

    static _notifyChange() {
        let emitter = this.emitter;

        if (emitter.listenerCount('change') > 0) {
            let config = this.getConfig();
            emitter.emit('change', config);
        }
    }

    static registerListener(listener: any) {
        this.emitter.addListener('change', listener);
    }

    static removeListener(listener: any) {
        this.emitter.removeListener('change', listener);
    }

    static addLogListener(listener: any) {
        this.emitter.addListener('log', listener);
        if (this.emitter.listenerCount('log') > 0) {
            this.ENABLE_CALLBACK = true;
            this._notifyChange();
        }
    }

    static removeLogListener(listener: any) {
        this.emitter.removeListener('log', listener);
        if (this.emitter.listenerCount('log') === 0) {
            this.ENABLE_CALLBACK = false;
            this._notifyChange();
        }
    }
}

export default LoggingControl
