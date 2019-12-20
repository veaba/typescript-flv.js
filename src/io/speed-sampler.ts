/***********************
 * @name todo
 * @author Jo.gel
 * @date 2019/12/19 0019
 ***********************/

// 计算实时网络I/O速度的实用类
class SpeedSampler {
    private _firstCheckpoint: number;
    private _intervalBytes: number;
    private _totalBytes: number;
    private _lastSecondBytes: number;
    private _lastCheckpoint: number;
    private readonly _now: any;

    constructor() {
        // 毫秒
        this._firstCheckpoint = 0;
        this._lastCheckpoint = 0;
        this._intervalBytes = 0;
        this._totalBytes = 0;
        this._lastSecondBytes = 0;

        // 兼容性检查
        if (self.performance && self.performance.now) {
            this._now = self.performance.now.bind(self.performance)
        } else {
            this._now = Date.now()
        }
    }

    /*****************拦截属性 *********************/

    get lastSecondKBps(): number {
        this.addBytes(0);
        if (this._lastSecondBytes !== 0) {
            return this._lastSecondBytes / 1024
        } else {
            // _lastSecondBytes=0
            if (this._now() - this._lastCheckpoint >= 500) {
                // 如果自上次检查点以来的时间间隔已超过500毫秒
                // 速度几乎是准确的
                return this.currentKBps
            } else {
                // 不知道是啥，所以返回0
                return 0
            }
        }
    }

    get currentKBps() {
        this.addBytes(0);
        let durationSeconds = (this._now() - this._lastCheckpoint) / 1000;
        if (durationSeconds == 0) durationSeconds = 1;
        return (this._intervalBytes / durationSeconds / 1024)
    }

    get averageKBps() {
        let durationSeconds = (this._now() - this._firstCheckpoint) / 1000;
        return (this._totalBytes / durationSeconds) / 1024
    }

    /*****************Public methods *********************/
    reset() {
        this._firstCheckpoint = this._lastCheckpoint = 0;
        this._totalBytes = this._intervalBytes = 0;
        this._lastSecondBytes = 0
    }

    addBytes(bytes: number) {
        if (this._firstCheckpoint === 0) {
            this._firstCheckpoint = this._now();
            this._lastCheckpoint = this._firstCheckpoint;
            this._intervalBytes += bytes;
            this._totalBytes += bytes
        } else if (this._now() - this._lastCheckpoint < 1000) {
            this._intervalBytes += bytes;
            this._totalBytes += bytes
        } else {
            // 期间 >=1000
            this._lastSecondBytes = this._intervalBytes;
            this._intervalBytes = bytes;
            this._totalBytes += bytes;
            this._lastCheckpoint = this._now()
        }
    }
}


export default SpeedSampler
