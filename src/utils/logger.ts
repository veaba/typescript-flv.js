/***********************
 * @name TS
 * @author Jo.gel
 * @date 2019/12/20 0020
 ***********************/

import {EventEmitter} from 'events'

class Log {
    protected GLOBAL_TAG: any;
    protected static GLOBAL_TAG: any;
    protected ENABLE_INFO: boolean;
    protected ENABLE_WARN: boolean;
    protected ENABLE_VERBOSE: boolean;
    protected ENABLE_ERROR: boolean;
    protected ENABLE_DEBUG: boolean;
    protected ENABLE_CALLBACK: boolean;
    protected emitter: any;
    static FORCE_GLOBAL_TAG: boolean; //TODO
    protected static emitter: any;
    protected static ENABLE_CALLBACK: boolean;
    protected static ENABLE_ERROR: boolean;
    protected static ENABLE_INFO: boolean;
    protected static ENABLE_WARN: boolean;
    protected static ENABLE_DEBUG: boolean;
    protected static ENABLE_VERBOSE: boolean;
    private FORCE_GLOBAL_TAG: boolean; //TODO

    constructor() {
        this.GLOBAL_TAG = "flv.js";
        this.FORCE_GLOBAL_TAG = false;
        this.ENABLE_ERROR = true;
        this.ENABLE_INFO = true;
        this.ENABLE_WARN = true;
        this.ENABLE_DEBUG = true;
        this.ENABLE_VERBOSE = true;

        this.ENABLE_CALLBACK = false;

        this.emitter = new EventEmitter();
    }

    static e(tag: string, msg: string) {
        if (!tag || Log.FORCE_GLOBAL_TAG)
            tag = Log.GLOBAL_TAG;

        let str = `[${tag}] > ${msg}`;

        if (Log.ENABLE_CALLBACK) {
            Log.emitter.emit('log', 'error', str);
        }

        if (!Log.ENABLE_ERROR) {
            return;
        }

        if (console.error) {
            console.error(str);
        } else if (console.warn) {
            console.warn(str);
        } else {
            console.log(str);
        }
    }

    static i(tag: string, msg: string) {
        if (!tag || Log.FORCE_GLOBAL_TAG)
            tag = Log.GLOBAL_TAG;

        let str = `[${tag}] > ${msg}`;

        if (Log.ENABLE_CALLBACK) {
            Log.emitter.emit('log', 'info', str);
        }

        if (!Log.ENABLE_INFO) {
            return;
        }

        if (console.info) {
            console.info(str);
        } else {
            console.log(str);
        }
    }

    static w(tag: string, msg: string) {
        if (!tag || Log.FORCE_GLOBAL_TAG)
            tag = Log.GLOBAL_TAG;

        let str = `[${tag}] > ${msg}`;

        if (Log.ENABLE_CALLBACK) {
            Log.emitter.emit('log', 'warn', str);
        }

        if (!Log.ENABLE_WARN) {
            return;
        }

        if (console.warn) {
            console.warn(str);
        } else {
            console.log(str);
        }
    }

    static d(tag: string, msg: string) {
        if (!tag || Log.FORCE_GLOBAL_TAG)
            tag = Log.GLOBAL_TAG;

        let str = `[${tag}] > ${msg}`;

        if (Log.ENABLE_CALLBACK) {
            Log.emitter.emit('log', 'debug', str);
        }

        if (!Log.ENABLE_DEBUG) {
            return;
        }

        if (console.debug) {
            console.debug(str);
        } else {
            console.log(str);
        }
    }

    static v(tag: string, msg: string) {
        if (!tag || Log.FORCE_GLOBAL_TAG)
            tag = Log.GLOBAL_TAG;

        let str = `[${tag}] > ${msg}`;

        if (Log.ENABLE_CALLBACK) {
            Log.emitter.emit('log', 'verbose', str);
        }

        if (!Log.ENABLE_VERBOSE) {
            return;
        }

        console.log(str);
    }

}

export default Log
