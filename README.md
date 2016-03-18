# loader-core
最简JS加载器。

特点：
* 以插入script标签的形式加载外链JS。
* 可扩展。

## 相关
* [`loader-css`]

## 浏览器使用方法
将dist目录下的[loader.js](dist/loader.js)或[loader.min.js](dist/loader.min.js)嵌入页面后，
可以页面中使用`window.Loader`

```js
Loader.load('https://s0.meituan.net/bs/jsm?f=require(@mtfe/zepto):dist/zepto.js@1.1.7-1').then(function () {
  // `window.Zepto` is available now
})

```

## 功能扩展

### 指定resolve方法
将多个请求合并成一个。

```js
var loader = new Loader({
  resolve: function (requests) {
    var prefix = 'https://s0.meituan.net/bs/jsm?f='
    var sources = {
      fastclick: 'require(fastclick):lib/fastclick.js@1.0.6',
      zepto: 'require(@mtfe/zepto):dist/zepto.js@1.1.7-1',
    }
    return prefix + [].concat(requests).map(function (request) {
      return sources[request]
    }).join(';')
  }
})

loader.load('fastclick').then(function () {
  // `window.FastClick` and `window.Zepto` are both ready
})

loader.load('zepto').then(function () {
  // `window.FastClick` and `window.Zepto` are both ready
})

```

### 指定loader
加载CSS。

```js
function loadCSS(src) {
  return new Promise(function (resolve, reject) {
    var node = document.createElement('link')
    node.setAttribute('type', 'text/css')
    node.setAttribute('rel', 'stylesheet')
    node.setAttribute('href', src)
    node.onload = function () {
      node.onerror = node.onload = null
      resolve()
    }
    node.onerror = function (err) {
      node.onerror = node.onload = null
      reject(err)
    }
    var ref = document.getElementsByTagName('script')[0]
    ref.parentNode.insertBefore(node, ref)
  })
}

var loader = new Loader({ loader: loadCSS })

loader.load('https://s0.meituan.net/bs/cssm/?f=fewww:/www/css/common.css,/www/css/base.css').then(function () {
  // styles are ready now
})

```

## API

### Loader.load(requests, type)
使用给定类型的默认加载器(`loader`)加载指定资源。

**requests**

Type: `String`, `Array`

**type**

Type: `String`

Default: `'js'`

### Loader.register(type, constructor)
注册给定的加载器，其后便可以通过`Loader.load(reqs, type)`来使用该加载器加载资源。

**type**

Type: `String`

**constructor**

Type: `Function`

下面注册一个CSS加载器：

```js
Loader.register('css', function (opts) {
  var loader = new Loader(opts)
  loader.loader = loadCSS
  return loader
})

function loadCSS(src) {
  return new Promise(function (resolve, reject) {
    var node = document.createElement('link')
    node.setAttribute('type', 'text/css')
    node.setAttribute('rel', 'stylesheet')
    node.setAttribute('href', src)
    node.onload = function () {
      node.onerror = node.onload = null
      resolve()
    }
    node.onerror = function (err) {
      node.onerror = node.onload = null
      reject(err)
    }
    var ref = document.getElementsByTagName('script')[0]
    ref.parentNode.insertBefore(node, ref)
  })
}

```

于是可以在浏览器中使用：
```js
Loader.load('https://s0.meituan.net/bs/cssm/?f=fewww:/www/css/common.css,/www/css/base.css', 'css')

```

### Loader.create(type, opts)
创建一个新的给定类型的加载器。

```js
var loader = Loader.create('css')

loader.resolve = function (requests) {
  var prefix = 'https://s0.meituan.net/bs/cssm?f=fewww:'
  var sources = {
    common: '/www/css/common.css',
    base: '/www/css/base.css',
  }
  return prefix + [].concat(requests).map(function (request) {
    return sources[request]
  }).join(';')
}

loader.load('common').then(function () {
  // common.css and base.css are downloaded together
})

loader.load('base').then(function () {
  // common.css and base.css are downloaded together
})

// OR
/*
loader.load(['common', 'base']).then(function () {
  // common.css and base.css are downloaded together
})
*/

```

## 如何开发新的加载器

`index.js`:

```js
var Loader = require('loader-core')

Loader.register('awesomeLoader', awesomeLoaderConstructor)

module.exports = Loader

```

使用[`browserify`]将其打包成浏览器端可用的包，并用[`uglify`]进行代码压缩。

一个加载器需要`resolve`和`loader`两个函数。
`resolve`负责将资源代号解析成绝对路径，
`loader`使用该绝对路径加载资源。

所以，尽量将一些通用的`resolve`或`loader`函数发成独立的包，
这样在开发加载器时便可以共用这些包。
或者，在开发加载器时，将这两部分置于独立模块中，可单独`require`。
如此，在用[`browserify`]打包时，便可以减少无用的代码。

譬如前面实现combo功能的`resolve`方法，
以及加载CSS的`loader`方法都是可以独立出来的。

## TODO

* 创建开发新加载器的脚手架

[`loader-css`]: https://github.com/loaderjs/loader-css
[`browserify`]: https://github.com/substack/node-browserify
[`uglify`]: https://www.npmjs.com/package/uglify-js

