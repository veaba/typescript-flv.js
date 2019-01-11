## 说明
> 本着学习的目的(typeScript、以及更高的知识点)，于是使用TypeScript重写  @xxk 的flv.js ，原项目 https://github.com/Bilibili/flv.js  ，由于是个人学习的项目，这里强烈不推荐用于生产环境！

> 本来fork 原项目，在上面改动的，结果发现clone 不下来，一直try again (y/n)，于是启用新项目来开发。
## 如何安排从头开始的构建工作？
`const player = flv.createPlayer()`->`player.attachMediaElement(element)`->`player.play()`
## flv 函数结构
```js

// 向window 提供的函数
// flv_destory(){},
// flv_load(){},
// flv_load_mds(){},
// flv_pause(){},
// flv_seekto(){}
// flv_start(){}
// flvsjs 构造函数
const flvjs = {
    BaseLoader(){}
    ErrorDetails:{},
    ErrorTypes:{},
    FlvPlayer(){},
    LoaderError:{},
    LoaderStatus:{},
    LogginControl(){},
    NativePlayer(){},
    createPlayer(){},
    getFeatureList(){},
    isSupported(){},
    version:String
}
// flve.js 实例
```
## 规划与设计
```js
    dist/
    ---- flvts.min.js   //压缩过的代码
    ---- flvts.all.js   //格式化的代码
    src/
    ---- core/      //核心代码
    ---- demux/     // 混码？不太明白啥意思，只有一丢丢video相关的概念
    ---- io/        // 输入输出，干吗的？(⊙o⊙)…
    ---- player/    // 播放器
    ---- remux/     // 似乎和demux 是相反的意思~
    ---- utils/     // 工具类函数
    ---- flvts.js
    ---- index.ts
    READEME.md 
```
## 吐槽
## 知识点&专业词汇
|en|desc|todo|
|----|----|----|
|demux|||
|demuxer|ffmpeg接口,视音频分离器||
|muxer|ffmpeg接口，视音频复用器，其实是将音轨和视频画面合并起来的意思吗？||
|remux|ffmpeg,封装格式转换||
|h.264|||
## LICENSE
> 我应该可以这么做吧~~（用typescript重写别人的项目~~，不太懂，有问题请联系我。）
原项目 https://github.com/Bilibili/flv.js   Bilibili /flv.js

Apache LICENSE 2.0


## Reference（参考索引）

`@1` https://blog.csdn.net/leixiaohua1020/article/details/39802819

