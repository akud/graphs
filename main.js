var greuler = global.greuler;
var GreulerAdapter = require('./src/GreulerAdapter');
var Graph = require('./src/Graph');
var Animator = require('./src/Animator');
var UrlState = require('./src/UrlState');
var ActionQueue = require('./src/ActionQueue');
var ResetButton = require('./src/ResetButton');
var EditMode = require('./src/EditMode');
var NodeLabelSet = require('./src/NodeLabelSet');
var ComponentManager = require('./src/ComponentManager');

require('./src/Logger').level = global.logLevel;

global.adapter = new GreulerAdapter(greuler);

var actionQueue = new ActionQueue();
var componentServices = {
  actionQueue: actionQueue,
};
var componentManager = new ComponentManager({
  actionQueue: actionQueue,
  componentServices: componentServices,
  document: document,
});

var state = new UrlState({
  baseUrl: window.location.protocol + "//" + window.location.host + window.location.pathname,
  setUrl: window.history.replaceState.bind(window.history, {}, ''),
  urlSearchParams: new URLSearchParams(window.location.search),
});

var labelSet = new NodeLabelSet({
  componentManager: componentManager,
  state: state,
});

var editMode = new EditMode({
  adapter: adapter,
  animator: new Animator({ actionQueue: actionQueue }),
  labelSet: labelSet,
  alternateInterval: 250,
});

var horizontalPadding = 20;
var width = Math.floor(((window.innerWidth > 0) ? window.innerWidth : screen.width) - (2 * horizontalPadding));
var height = Math.floor(( 3/4 ) * ((window.innerHeight > 0) ? window.innerHeight : screen.height));
var nodeSize;
var edgeDistance;

if (width < 1000) {
  nodeSize = Math.floor(Math.min(width, height) * (1/18));
  edgeDistance = 200;
}


global.graph = new Graph(Object.assign(
  {
    adapter: adapter,
    editMode: editMode,
    labelSet: labelSet,
    state: state,
    width: width,
    height: height,
    nodeSize: nodeSize,
    edgeDistance: edgeDistance,
    nodeAreaFuzzFactor: 0.1,
  },
  componentServices
));

global.resetButton = new ResetButton({
  actionQueue: actionQueue,
  resettables: [
    global.graph,
  ],
});

global.graph.attachTo(document.getElementById('main-graph'));
global.resetButton.attachTo(document.getElementById('reset-button'));
