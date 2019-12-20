/***********************
 * @author Jo.gel
 * @date 2019/12/19 0019
 ***********************/

export const defaultConfig = {
    enableWorker: false,
    enableStashBuffer: true,
    stashInitialSize: 0,

    isLive: false,

    lazyLoad: true,
    lazyLoadMaxDuration: 3 * 60,
    lazyLoadRecoverDuration: 30,
    deferLoadAfterSourceOpen: true,

    // autoCleanupSourceBuffer:default as false, leave unspecified

    autoCleanupMaxBackwardDuration: 3 * 60,
    autoCleanupMinBackwardDuration: 2 * 60,

    statisticsInfoReportInterval: 600,

    fixAudioTimestampGap: true,

    accurateSeek: false,
    seekType: 'range',//range、param、custom
    seekParamStart: 'bstart',
    seekParamEnd: 'bend',
    rangeLoadZeroStart: false,
    customSeekHandler: "",
    reuseRedirectedURL: false,

    // 引用策略:保留为未指定
    headers: Object.create(null),
    customLoader: Object.create(null)
};

/*
* @desc
* Error:(11, 19) TS2339: Property 'assign' does not exist on type 'ObjectConstructor'.
* */
export const createDefaultConfig = function () {
    return Object.assign({}, defaultConfig);    // es6 才支持，需要更改tsconfig.json 的target:"es5" -> target:'es6'
    // return (<any>Object).assign({}, defaultConfig); es5 支持
};

export const MEDIA_SOURCE_TYPE = 'video/mp4; codecs="avc1.42E01E,mp4.40.2"';

// io 速度列表
// export const SPEED_NORMALIZE_LIST=[64, 128, 256, 384, 512, 768, 1024, 1536, 2048, 3072, 4096];

// mp4文件特征字符串
export const NATIVE_MP4H264_PLAYBACK = 'video/mp4; codecs="avc1.2001E, mp4a.40.2"';
export const NATIVE_WEBM_VP8_PLAYEBACK = 'video/webm; codecs="vp8.0, vorbis"';
export const NATIVE_WEBM_VP9_PLAYEBACK = 'video/webm; codecs="vp9"';

