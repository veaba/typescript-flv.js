import {BaseLoader,LoaderError,LoaderStatus} from './io/loader'
import {error_Types,error_Details} from './player/player-errors'
class Flv {
    constructor(x,y){
        this.x=x
        this.y=y
        this.version="1.5.0"
    }

    // BaseLoader todo
    BaseLoader:BaseLoader

    // ErrorDetails
    ErrorDetails:error_Details,

    // ErrorTypes
    ErrorTypes:error_Types

    // Events

    // FlvPlayer

    LoaderError:LoaderError

    LoaderStatus:LoaderStatus

    // LoggingControl

    // NativePlayer

    // createPlayer
    createPlayer(){

    }

    // getFeatureList
    getFeatureList(){

    }
    // isSupported

    // version
    
}
