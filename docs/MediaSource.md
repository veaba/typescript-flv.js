# MediaSource
> MDN https://developer.mozilla.org/en-US/docs/Web/API/MediaSource

> 是Media Source Extensions API表示媒体资源 HTMLMediaeElement 对象的接口。MediaSource 对象附着在HTMLMediaElement在客户端播放

## 疑问
- 方法和静态方法有什么区别？？
## Properties属性
- `MediaSource.sourceBuffer` <sup>只读</sup>
- `MediaSource.activeSourceBuffer` <sup>只读</sup>
- `MediaSource.readyState` <sup>只读</sup>
- `MediaSource.duration`
### 事件处理
- `MediaSource.onsourceclose`
- `MediaSource.onsourceended`
- `MediaSource.onsourceopen`
## Methods方法
> 集成来自父级的接口，EventTarget
- `MediaSource.addSourceBuffer()`
- `MediaSource.clearLiveSeekableRange()`
- `MediaSource.endOfStream()`
- `MediaSource.removeSourceBuffer()`
- `MediaSource.setLiveSeekableRange()`
## Static methods静态方法

- `isTypeSupported`只有一个静态方法 {String}
```js
const mimeCode = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
MediaSource.isTypeSupported(mimeCode)

```
> 返回boolean，表明给定的MIME类型是否被当前的浏览器支持，意味着是否可以成功创建这个MIME类型的`SourceBuffer`对象
## demo

### load完，立即播放
> https://developer.mozilla.org/zh-CN/docs/Web/API/MediaSource#Browser_compatibility
```js
var video = document.querySelector('video');

var assetURL = 'frag_bunny.mp4';
// Need to be specific for Blink regarding codecs
// ./mp4info frag_bunny.mp4 | grep Codec
var mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';

if ('MediaSource' in window && MediaSource.isTypeSupported(mimeCodec)) {
  var mediaSource = new MediaSource();
  //console.log(mediaSource.readyState); // closed
  video.src = URL.createObjectURL(mediaSource);
  mediaSource.addEventListener('sourceopen', sourceOpen);
} else {
  console.error('Unsupported MIME type or codec: ', mimeCodec);
}

function sourceOpen (_) {
  //console.log(this.readyState); // open
  var mediaSource = this;
  var sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
  fetchAB(assetURL, function (buf) {
    sourceBuffer.addEventListener('updateend', function (_) {
      mediaSource.endOfStream();
      video.play();
      //console.log(mediaSource.readyState); // ended
    });
    sourceBuffer.appendBuffer(buf);
  });
};

function fetchAB (url, cb) {
  console.log(url);
  var xhr = new XMLHttpRequest;
  xhr.open('get', url);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function () {
    cb(xhr.response);
  };
  xhr.send();
};
```
## 兼容性
基本支持，除了沙雕Safari on iOS、IE11以下
> https://developer.mozilla.org/zh-CN/docs/Web/API/MediaSource#Browser_compatibility