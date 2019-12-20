import {BaseLoader, LoaderErrors, LoaderStatus} from './io/loader'
import {error_Types, error_Details} from './player/player-errors'
import Features from 'core/Features'
import {InvalidArgumentException} from "./utils/exception";
import FlvPlayer from './player/flv-player'
import NativePlayer from './player/native-player'
import PlayerEvents from './player/player-events'

import LoggingControl from './utils/logging-control'


class Flv {
    // version
    private version: string;
    public y: any;
    public x: any;

    constructor(x: any, y: any) {
        this.x = x;
        this.y = y;
        this.version = "1.5.0"
    }

    // BaseLoader
    BaseLoader: BaseLoader;

    // ErrorDetails
    ErrorDetails = error_Details;

    // ErrorTypes
    ErrorTypes = error_Types;

    // Events
    Events = PlayerEvents;

    LoaderError = LoaderErrors;

    LoaderStatus = LoaderStatus;

    // LoggingControl
    LoggingControl = LoggingControl;
    // FlvPlayer
    FlvPlayer = FlvPlayer;

    // NativePlayer
    NativePlayer = NativePlayer;

    // createPlayer
    createPlayer(mediaDataSource: any, optionalConfig: any) {
        let mds = mediaDataSource;
        if (mds === null || typeof mds !== 'object') {
            throw new InvalidArgumentException('MediaDataSource 必须是Javascript Object!')
        }
        if (!mds.hasOwnProperty('type')) {
            throw new InvalidArgumentException('MediaDataSource 必须是有类型字段以指示视频文件类型')
        }

        if (mds.type === 'flv') {
            // 视频格式是flv走 class FlvPlayer
            return new FlvPlayer(mds, optionalConfig)
        } else {
            // 其他视频格式走原生播放器
            return new NativePlayer(mds, optionalConfig)
        }
    }

    // getFeatureList
    getFeatureList() {
        return Features.getFeatureList
    }

    // isSupported
    isSupported() {
        return Features.supportMSEH264Playback()
    }


}
