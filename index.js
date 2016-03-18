var RESOLVED = Promise.resolve()

function Loader(opts) {
  opts = opts || {}
  this.resolve = opts.resolve || resolveJS
  this.loader = opts.loader || loadJS
  this._state = { requests: [] }
}

Loader.prototype.load = function (requests) {
  requests = [].concat(requests).filter(Boolean)
  if (!requests.length) return RESOLVED

  var self = this
  var state = self._state
  state.requests.push.apply(state.requests, requests)

  if (!state.loaded) {
    // Allow this loader to collect more requests
    // by invoking `this.load` in the same tick
    state.loaded = RESOLVED.then(function () {
      self._state = { requests: [] }
      return self.resolve(state.requests)
    })
    .then(function (rows) {
      return Promise.all(
        [].concat(rows).filter(Boolean).map(function (src) {
          return RESOLVED.then(function () {
            return self.loader(src)
          })
        })
      )
    })
  }

  return state.loaded
}

/* loadJS: load a JS file asynchronously. [c]2014 @scottjehl, Filament Group, Inc.
 * (Based on http://goo.gl/REQGQ by Paul Irish). Licensed MIT */
function loadJS(src) {
  return new Promise(function (resolve, reject) {
    var node = document.createElement('script')
    node.setAttribute('src', src)
    node.async = true
    node.onload = node.onreadystatechange = function () {
      node.onerror = node.onload = node.onreadystatechange = null
      resolve()
    }
    node.onerror = function (err) {
      node.onerror = node.onload = node.onreadystatechange = null
      reject(err)
    }
    var ref = document.getElementsByTagName('script')[0]
    ref.parentNode.insertBefore(node, ref)
  })
}

function resolveJS(r) {
  return r
}

Loader.Loader = Loader

var loaders = Loader._loaders = {}
Loader.register = function (name, ctor) {
  loaders[name] = ctor
}
Loader.create = function (type, opts) {
  return new loaders[type](opts)
}
Loader.register('js', Loader)

var instances = Loader._instances = {}
Loader.load = function (requests, type) {
  type = type || 'js'
  if (!loaders[type]) {
    throw new Error('Loader for `' + type + '` not found.')
  }
  if (!instances[type]) {
    instances[type] = new loaders[type]()
  }
  return instances[type].load(requests)
}

module.exports = Loader

