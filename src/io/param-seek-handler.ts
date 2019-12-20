/***********************
 * @name TS
 * @author Jo.gel
 * @date 2019/12/20 0020
 ***********************/

class ParamSeekHandler {
    private readonly _endName: string;
    private readonly _startName: string;

    constructor(paramStart: string, paramEnd: string) {
        this._startName = paramStart;
        this._endName = paramEnd
    }

    getConfig(baseUrl: string, range: any) {
        let url = baseUrl;
        if (range.from !== 0 || range.to !== -1) {
            let needAnd = true;
            // url 不存在问号
            if (url.indexOf('?') == -1) {
                url += '?';
                needAnd = false
            }
            if (needAnd) {
                url += '&'
            }
            url += `${this._startName}=${range.from.toString()}`;

            if (range.to !== -1) {
                url += `&${this._endName}=${range.to.toString()}`
            }
        }
        return {
            url,
            headers: {}
        }

    }

    removeURLParameters(seekedURL: string) {
        let baseUrl = seekedURL.split('?')[0];
        let params: any = undefined;

        let queryIndex = seekedURL.indexOf('?');
        if (queryIndex !== -1) {
            params = seekedURL.substring(queryIndex + 1)
        }
        let resultParams: string = '';
        if (params !== undefined && params.length > 0) {
            let pairs = params.split('&');
            for (let i = 0; i < pairs.length; i++) {
                let pair = pairs[i].split('=');
                let requireAnd = (i > 0);

                if (pair[0] !== this._startName && pair[0] !== this._endName) {
                    if (requireAnd) {
                        resultParams += '&'
                    }
                    resultParams += pairs[i]
                }
            }
        }
        return (resultParams.length === 0) ? baseUrl : (baseUrl + '?' + resultParams)
    }
}


export default ParamSeekHandler
