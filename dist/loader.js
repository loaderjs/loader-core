(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Loader = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


},{}]},{},[1])(1)
});