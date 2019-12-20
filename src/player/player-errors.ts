import {LoaderErrors} from '../io/loader'
import DemuxErrors from '../demux/demux-errors'

export const error_Types = {
    NETWORD_ERROR: "NetworkError",
    MEDAI_ERROR: "MedaiError",
    OTHTER: "OtherError"
};
/**
 * @decs 错误的详情
 */
export const error_Details = {
    NETWORK_EXCEPTION: LoaderErrors.EXCEPTION,
    NETWORK_STATUS_CODE_INVALID: LoaderErrors.HTTP_STATUS_CODE_INVALID,
    NETWORK_TIMEOUT: LoaderErrors.CONNECTING_TIMEOUT,
    NETWORD_UNRECOVERABLE_EARLY_EOF: LoaderErrors.UNRECOVERABLE_EARLY_EOF,

    NETWORD_MSE_ERROR: "MediaMSEError",

    NETWORD_FORMAT_ERROR: DemuxErrors.FORMAT_ERROR,
    NETWORD_UNSUPPORTED: DemuxErrors.FORMAT_UNSUPPORTED,
    NETWORD_CODEC_UNSUPPORTED: DemuxErrors.CODEC_UNSUPPORTED,
};
