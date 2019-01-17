# MSE(Media Source Extension API)

## 媒体源拓展 API
- [`MediaSource`](./MediaSource.md)
> 将由 `HTMLMediaElement` 对象播放的媒体资源
- `SourceBuffer`
> 一个经由MediaSource 对象传入的`HTMLMediaElement`媒体块
- `SourceBufferList`
> 列出多个`SourceBuffer`对象的简单的容器列表
- `VideoPlaybackQuality`
> 由`HTMLVideoElement.getVideoPlaybackQuality`方法返回被丢弃或损坏的帧的数量
- `TrackDefault`
> 为媒体快的初始阶段，没有包含类型、标签、语言信息的轨道，提供一个包含这些信息的`SourceBuffer`
- `TrackDefaultList`
> 列出多个`TrackDefault`对象的简单的容器列表

## 其他接口 API
- URL.createObjectURL()
>指向`MediaSource`对象的URL，要求URL被指定用来播放媒体流的HTML媒体元素的`src`的值
- `HTMLMediaElement.seekable`
> `MediaSource`对象被HTML媒体元素播放时，将返回一个包含用户能够在什么时间范围内进行调整对象的`TimeRanges`
- `HTMLVideoElement.getVideoPlaybackQuality()`
> 针对正在播放视频，返回一个`VideoPlaybackQuality`对象
- `AudioTack.sourceBuffer`
- `VideoTrack.sourceBuffer`
- `TextTrack.sourceBuffer`


