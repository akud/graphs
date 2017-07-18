var greuler = global.greuler;
var GreulerAdapter = require('./src/GreulerAdapter');
var Graph = require('./src/Graph');

var horizontalPadding = 20;
var screenWidth = ((window.innerWidth > 0) ? window.innerWidth : screen.width);
var screenHeight = ((window.innerHeight > 0) ? window.innerHeight : screen.height);

global.adapter = new GreulerAdapter(greuler);
global.graph = new Graph(
  {
    adapter: adapter,
  },
  {
    width: screenWidth - (2 * horizontalPadding),
    height: (3/4) * screenHeight,
  });

global.graph.attachTo(document.getElementById('main-graph'));
