/***********************
 * @name TS Flv typeScript 的声明文件
 * @author Jo.gel
 * @date 2019/3/8 0008
 * @关于ts模块 https://zhongsp.gitbooks.io/typescript-handbook/content/doc/handbook/Modules.html
 ***********************/
// 内部模块-> 命名空间
// 外部模块-> 模块
// 将整个模块导入到一个变量
// declare namespace FlvTS{
//     // interface type_LoaderStatus {
//     //     kIdle:number,
//     //     kConnecting:number,
//     //     kBuffering:number,
//     //     kError:number,
//     //     kComplete:number
//     // }
//     interface featuresTs {
//
//     }
// }

// export default  FlvTS

export interface featuresT {

}

export interface ioControllerT {
    TAG: string
}

export interface ioControllerConfigT {
    stashInitialSize?: number
    enableStashBuffer?: boolean

}

export interface ioControllerDataSourceT {
    url?: string
    redirectedURL?: string
    filesize?: number
}

export interface dataSourceT {
    url: string
}
