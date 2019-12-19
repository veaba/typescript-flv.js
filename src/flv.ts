import {BaseLoader, LoaderError, LoaderStatus} from './io/loader'
import {error_Types, error_Details} from './player/player-errors'
import Features from 'core/Features'

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

    // FlvPlayer

    LoaderError = LoaderError;

    LoaderStatus = LoaderStatus;

    // LoggingControl

    // NativePlayer

    // createPlayer
    createPlayer() {

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
