/***********************
 * @name Features
 * @author Jo.gel
 * @date 2019/12/19 0019
 * @类加static，不会被实例继承，静态方法
 ***********************/
import IOController from '../io/io-controller'
import {
    createDefaultConfig,
    MEDIA_SOURCE_TYPE,
    NATIVE_MP4H264_PLAYBACK,
    NATIVE_WEBM_VP8_PLAYEBACK,
    NATIVE_WEBM_VP9_PLAYEBACK
} from '../config'

class Features {

    // videoElement: any=undefined;
    private static videoElement: any = undefined;

    constructor() {
    }

    /*
    * @desc 支持MES H264 回放
    * @Error:(16, 23) TS2339: Property 'MediaSource' does not exist on type 'Window'.
    * @Fix: const w:any=window;，给一个中间的变量
    * */
    static supportMSEH264Playback() {
        const w: any = window;
        return w.MediaSource && w.MediaSource.isTypeSupported(MEDIA_SOURCE_TYPE)
    }

    /*
    * @desc 支持网络流IO
    * */
    static supportNetworkStreamIO() {
        let ioctl = new IOController({}, createDefaultConfig());
        let loaderType = ioctl.loaderType;
        ioctl.destroy();
        return loaderType == 'fetch-stream-loader' || loaderType == 'xhr-moz-chunked-loader'
    }

    /*
    * @desc 获取网络加载类型名称
    * */
    static getNetworkLoaderTypeName() {
        let ioctl = new IOController({}, createDefaultConfig());
        let loaderType = ioctl.loaderType;
        ioctl.destroy();
        return loaderType
    }

    /*
    * @desc 支持原生媒体回放
    * Error:(47, 22) TS2339: Property 'videoElement' does not exist on type 'typeof Features'.
    * fix:private static videoElement:any=undefined;
    * */
    static supportNativeMediaPlayback(mineType: any) {
        if (Features.videoElement == undefined) {
            Features.videoElement = window.document.createElement('video')
        }
        let canPlay = Features.videoElement.canPlayType(mineType);
        return canPlay === 'probably' || canPlay == 'maybe'
    }

    /**
     * @desc 获取特性列表
     * */
    static getFeatureList() {
        // todo 如何使用类型声明,flv.d.ts
        const features = {
            mseFlvPlayback: false,
            mseLiveFlvPlayback: false,
            networkStreamIO: false,
            networkLoaderName: '',
            nativeMP4H264Playback: false,
            nativeWebmVP8Playeback: false,
            nativeWebmVP9Playback: false
        };
        features.mseFlvPlayback = Features.supportMSEH264Playback();
        features.networkStreamIO = Features.supportNetworkStreamIO();
        features.networkLoaderName = Features.getNetworkLoaderTypeName();
        features.mseLiveFlvPlayback = Features.supportNetworkStreamIO();
        features.nativeMP4H264Playback = Features.supportNativeMediaPlayback(NATIVE_MP4H264_PLAYBACK);
        features.nativeWebmVP8Playeback = Features.supportNativeMediaPlayback(NATIVE_WEBM_VP8_PLAYEBACK);
        features.nativeWebmVP9Playback = Features.supportNativeMediaPlayback(NATIVE_WEBM_VP9_PLAYEBACK);

        return features
    }
}

export default Features
