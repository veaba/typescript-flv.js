/***********************
 * @name TS
 * @author Jo.gel
 * @date 2019/12/20 0020
 ***********************/

import {EventEmitter} from 'events'

class Log {
    private GLOBAL_TAG: string;
    private FORCE_GLOBAL_TAG: boolean;
    private ENABLE_INFO: boolean;
    private ENABLE_WARN: boolean;
    private ENABLE_VERBOSE: boolean;
    private ENABLE_CALLBACK: boolean;
    private emitter: any;
    private ENABLE_ERROR: boolean;
    private ENABLE_DEBUG: boolean;
    private static FORCE_GLOBAL_TAG: boolean;
    private static GLOBAL_TAG: string;
    private static emitter: any;
    private static ENABLE_CALLBACK: boolean;
    private static ENABLE_ERROR: boolean;
    private static ENABLE_INFO: boolean;
    private static ENABLE_WARN: boolean;
    private static ENABLE_DEBUG: boolean;
    private static ENABLE_VERBOSE: boolean;

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
