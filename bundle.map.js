{
  "version": 3,
  "sources": [
    "node_modules/browser-pack/_prelude.js",
    "main.js",
    "src/Component.js",
    "src/Graph.js"
  ],
  "names": [],
  "mappings": "AAAA;;ACAA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;;;ACVA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;ACdA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA",
  "file": "generated.js",
  "sourceRoot": "",
  "sourcesContent": [
    "(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require==\"function\"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error(\"Cannot find module '\"+o+\"'\");throw f.code=\"MODULE_NOT_FOUND\",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require==\"function\"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})",
    "var greuler = global.greuler;\nvar Graph = require('./src/Graph');\n\nfunction gruelerAdapter() {\n  return greuler.apply(this, arguments).update();\n}\n\nvar graph = new Graph(greulerAdapter);\n\ngraph.attachTo(document.getElementById('main-graph'));\n",
    "function Component() {\n\n}\n\nComponent.prototype = {\n  attachTo: function(element) {\n    //Object.keys(this.eventHandlers).forEach(function(evt) {\n      //element.addEventListener('click', this.handleClick.bind(this));\n    //}, this);\n    //this.postAttach(element);\n  },\n};\n\nmodule.exports = Component;\n",
    "var Component = require('./Component');\n\nconsole.log(Component);\n\nfunction Graph(greuler) {\n  Component.apply(this);\n  this.greuler = greuler;\n}\n\n\nGraph.prototype = Object.assign(new Component(), {\n  attachTo: function(targetElement) {\n    this.instance = this.greuler({\n      target: '#' + targetElement.id,\n    });\n    targetElement.addEventListener('click', this.handleClick.bind(this));\n  },\n  handleClick: function(event) {\n    console.log(event);\n  }\n});\n\nmodule.exports = Graph;\n"
  ]
}