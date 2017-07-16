var greuler = global.greuler;
var GreulerAdapter = require('./src/GreulerAdapter');
var Graph = require('./src/Graph');


global.adapter = new GreulerAdapter(greuler);
global.graph = new Graph(adapter);

global.graph.attachTo(document.getElementById('main-graph'));
