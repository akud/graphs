var greuler = global.greuler;
var GreulerAdapter = require('./src/GreulerAdapter');
var Graph = require('./src/Graph');

var graph = new Graph(new GreulerAdapter(greuler));

graph.attachTo(document.getElementById('main-graph'));
