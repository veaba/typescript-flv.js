/***********************
 * @desc WebSocket
 * @author Jo.gel
 * @date 2019/12/20 0020
 * @todo 想把这个文件，改写为socket.io
 ***********************/
import {BaseLoader, LoaderStatus, LoaderError} from "./loader";
import {RuntimeException} from "../utils/exception";

// 用于WebSocket直播流上的FLV
class WebsocketLoader extends BaseLoader {
    private TAG: string;
    private _ws: null;
    private _requestAbort: boolean;
    private _receivedLength: number;

    static isSupported() {
        const w: any = this;
        try {
            return (typeof w.WebSocket !== "undefined")
        } catch (e) {
            return false
        }
    }

    constructor() {
        super('websocket-loader');
        this.TAG = 'WebSocketLoader';
        this._needStash = true;
        this._ws = null;
        this._requestAbort = false;
        this._receivedLength = 0
    }

    destroy() {
        if (this._ws) {
            this.abort()
        }
        super.destroy()
    }

    open(dataSource: any) {
        const w: any = this;
        try {
            let ws = this._ws = new w.WebSocket(dataSource.url);
            ws.binaryType = 'arraybuffer';
            ws.onopen = this._onWebSocketOpen.bind(this);
            ws.onclose = this._onWebSocketClose.bind(this);
            ws.onmessage = this._onWebsocketMessage.bind(this);
            ws.onerror = this._onWebSocketError.bind(this);

            this._status = LoaderStatus.kConnecting
        } catch (e) {
            this._status = LoaderStatus.kError;
            let info = {code: e.code, msg: e.message};
            if (this._onError) {
                this._onError(LoaderError.EXCEPTION, info)
            } else {
                throw new RuntimeException(info.msg)
            }
        }
    }

    abort() {
        let ws: any = this._ws;
        // CONNECTING || OPEN
        if (ws && (ws.readyState === 0 || ws.readyState === 1)) {
            this._requestAbort = true;
            ws.close()
        }
        this._ws = null;
        this._status = LoaderStatus.kComplete
    }

    /*************** 私有方法 ****************/
    _onWebSocketOpen() {
        this._status = LoaderStatus.kBuffering
    }

    _onWebSocketClose() {
        if (this._requestAbort === true) {
            this._requestAbort = false;
            return
        }
        this._status = LoaderStatus.kComplete;

        if (this._onComplete) {
            this._onComplete(0, this._receivedLength - 1)
        }
    }

    _onWebsocketMessage(e: any) {
        if (e.data instanceof ArrayBuffer) {
            this._dispatchArrayBuffer(e.data)
        } else if (e.data instanceof Blob) {
            let render = new FileReader();
            render.onload = () => {
                this._dispatchArrayBuffer(render.result)
            };
            render.readAsArrayBuffer(e.data)
        } else {
            this._status = LoaderStatus.kError;
            let info = {code: -1, msg: 'Unsupported WebSocket message type: ' + e.data.constructor.name};

            if (this._onError) {
                this._onError(LoaderError.EXCEPTION, info)
            } else {
                throw  new RuntimeException(info.msg)
            }
        }
    }

    _onWebSocketError(e: any) {
        this._status = LoaderStatus.kError;
        const info = {
            code: e.code,
            msg: e.message
        };
        if (this._onError) {
            this._onError(LoaderError.EXCEPTION, info)
        } else {
            throw new RuntimeException(info.msg)
        }
    }

    _dispatchArrayBuffer(arraybuffer: any) {
        let chunk = arraybuffer;
        let byteStart = this._receivedLength;
        this._receivedLength += chunk.byteLength;

        if (this._onDataArrival) {
            this._onDataArrival(chunk, byteStart, this._receivedLength)
        }
    }
}

export default WebsocketLoader
