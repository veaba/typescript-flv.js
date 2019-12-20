/***********************
 * @name TS
 * @author Jo.gel
 * @date 2019/12/20 0020
 ***********************/

class RangeSeekHandler {
    private _zeroStart: number | boolean;

    constructor(zeroStart: number | boolean) {
        this._zeroStart = zeroStart || false
    }

    getConfig(url: string, range: any) {
        const headers: any = {};
        if (range.from !== 0 || range.to !== -1) {
            let param;
            if (range.to !== -1) {
                param = ` bytes=${range.from.toString()}-${range.to.toString()}`
            } else {
                param = ` bytes=${range.from.toString()}-`
            }
            headers['Range'] = param
        }
        return {
            url,
            headers
        }
    }

    removeURLParameters(seekURL: string) {
        return seekURL
    }
}

export default RangeSeekHandler
