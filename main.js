var greuler = global.greuler;
var GreulerAdapter = require('./src/GreulerAdapter');
var Graph = require('./src/Graph');
var Animator = require('./src/Animator');
var UrlState = require('./src/UrlState');
var ActionQueue = require('./src/ActionQueue');
var ResetButton = require('./src/ResetButton');
var EditMode = require('./src/EditMode');

require('./src/Logger').level = global.logLevel;

var actionQueue = new ActionQueue();

var horizontalPadding = 20;
var width = Math.floor(((window.innerWidth > 0) ? window.innerWidth : screen.width) - (2 * horizontalPadding));
var height = Math.floor(( 3/4 ) * ((window.innerHeight > 0) ? window.innerHeight : screen.height));
var nodeSize;
var edgeDistance;

if (width < 1000) {
  nodeSize = Math.floor(Math.min(width, height) * (1/18));
  edgeDistance = 200;
}

global.adapter = new GreulerAdapter(greuler);
global.graph = new Graph(
  {
    actionQueue: actionQueue,
    adapter: adapter,
    editMode: new EditMode({
      adapter: adapter,
      animator: new Animator({ actionQueue: actionQueue }),
      alternateInterval: 250,
    }),
    state: new UrlState({
      baseUrl: window.location.protocol + "//" + window.location.host + window.location.pathname,
      setUrl: window.history.replaceState.bind(window.history, {}, ''),
      urlSearchParams: new URLSearchParams(window.location.search),
    }),
    width: width,
    height: height,
    nodeSize: nodeSize,
    edgeDistance: edgeDistance,
    nodeAreaFuzzFactor: 0.1,
  });

global.resetButton = new ResetButton({
  actionQueue: actionQueue,
  resettables: [
    global.graph,
  ],
});

global.graph.attachTo(document.getElementById('main-graph'));
global.resetButton.attachTo(document.getElementById('reset-button'));
