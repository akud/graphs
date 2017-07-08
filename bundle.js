(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var greuler = global.greuler;
var GreulerAdapter = require('./src/GreulerAdapter');
var Graph = require('./src/Graph');

var graph = new Graph(new GreulerAdapter(greuler));

graph.attachTo(document.getElementById('main-graph'));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./src/Graph":3,"./src/GreulerAdapter":4}],2:[function(require,module,exports){
function Component() {

}

Component.prototype = {
  attachTo: function(element) {
    //Object.keys(this.eventHandlers).forEach(function(evt) {
      //element.addEventListener('click', this.handleClick.bind(this));
    //}, this);
    //this.postAttach(element);
  },
};

module.exports = Component;

},{}],3:[function(require,module,exports){
var Component = require('./Component');

function Graph(adapter) {
  Component.apply(this);
  this.adapter = adapter;
  this.nodes = [];
}


Graph.prototype = Object.assign(new Component(), {
  attachTo: function(targetElement) {
    this.adapter.initialize(targetElement);
    targetElement.addEventListener('click', this.handleClick.bind(this));
  },
  handleClick: function(event) {
    if (this.nodes.length < 5) {
      var node = {
        id: this.nodes.length,
        label: '',
      };
      this.nodes.push(node);
      this.adapter.addNode(node);
    }
  }
});

module.exports = Graph;

},{"./Component":2}],4:[function(require,module,exports){
function GreulerAdapter(greuler) {
  this.greuler = greuler;
}


GreulerAdapter.prototype = {
  initialize: function(targetNode) {
    this.instance = this.greuler({
      target: '#' + targetNode.id,
    }).update();
  },

  addNode: function(node) {
    this.instance.graph.addNode(node);
    this.instance.update();
  },
};

module.exports = GreulerAdapter;

},{}]},{},[1]);
