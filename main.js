var greuler = global.greuler;
var GreulerAdapter = require('./src/GreulerAdapter');
var Graph = require('./src/Graph');
var Animator = require('./src/Animator');
var UrlState = require('./src/UrlState');

var horizontalPadding = 20;
var width = Math.floor(((window.innerWidth > 0) ? window.innerWidth : screen.width) - (2 * horizontalPadding));
var height = Math.floor(( 3/4 ) * ((window.innerHeight > 0) ? window.innerHeight : screen.height));
var nodeSize;

if (width < 700) {
  nodeSize = Math.floor(Math.min(width, height) * (1/15));
}

global.adapter = new GreulerAdapter(greuler);
global.graph = new Graph(
  {
    adapter: adapter,
    animator: new Animator(),
    state: new UrlState({
      baseUrl: window.location.protocol + "//" + window.location.host + window.location.pathname,
      setUrl: window.history.replaceState.bind(window.history, {}, ''),
      urlSearchParams: new URLSearchParams(window.location.search),
    }),
  },
  {
    width: width,
    height: height,
    nodeSize: nodeSize,
    nodeAreaFuzzFactor: 0.1,
    editModeAlternateInterval: 250,
  });

global.graph.attachTo(document.getElementById('main-graph'));
