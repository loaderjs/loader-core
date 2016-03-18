var test = require('tape')
var Loader = require('..')

function bsResolver(requests) {
  var prefix = 'https://s0.meituan.net/bs/jsm?f='
  var sources = {
    fastclick: 'require(fastclick):lib/fastclick.js@1.0.6',
    zepto: 'require(@mtfe/zepto):dist/zepto.js@1.1.7-1',
  }
  return prefix + [].concat(requests).map(function (request) {
    return sources[request]
  }).join(';')
}

function reset() {
  window.FastClick = null
  window.Zepto = null
}

test('single', function (t) {
  reset()
  t.plan(2)

  var loader = new Loader({
    resolve: function (requests) {
      return requests.map(bsResolver)
    },
  })

  loader.load('fastclick').then(function () {
    t.ok(!!window.FastClick, 'fastclick done')
  })

  loader.load('zepto').then(function () {
    t.ok(!!window.Zepto, 'zepto done')
  })
})

test('combo', function (t) {
  reset()
  t.plan(2)

  var loader = new Loader({ resolve: bsResolver })

  loader.load('fastclick').then(function () {
    t.ok(!!window.FastClick, 'fastclick done')
  })

  loader.load('zepto').then(function () {
    t.ok(!!window.Zepto, 'zepto done')
  })
})

