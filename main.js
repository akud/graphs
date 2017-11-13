var GreulerAdapter = require('./src/graphs/GreulerAdapter');
var UrlState = require('./src/state/UrlState');
var ActionQueue = require('./src/ActionQueue');
var ResetButton = require('./src/components/ResetButton');
var graphfactory = require('./src/graphs/graphfactory');

require('./src/Logger').level = global.logLevel;

var actionQueue = new ActionQueue();
var urlSearchParams = new URLSearchParams(window.location.search);
var state = new UrlState({
  baseUrl: window.location.protocol + "//" + window.location.host + window.location.pathname,
  setUrl: window.history.replaceState.bind(window.history, {}, ''),
  urlSearchParams: urlSearchParams,
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

var immutable = urlSearchParams.get('immutable') === 'true';
var allowAddNodes = urlSearchParams.get('allowAddNodes') !== 'false';
var allowAddEdges = urlSearchParams.get('allowAddEdges') !== 'false';
var allowEdit = urlSearchParams.get('allowEdit') !== 'false';
var allowChangeColors = urlSearchParams.get('allowChangeColors') !== 'false';
var allowLabels = urlSearchParams.get('allowLabels') !== 'false';


global.graphComponent = graphfactory.newGraphComponent({
  document: global.document,
  adapter: new GreulerAdapter({ greuler: global.greuler }),
  actionQueue: actionQueue,
  state: state,
  width: width,
  height: height,
  nodeAreaFuzzFactor: 0.1,
  edgeDistance: edgeDistance,
  alternateInterval: 250,
  immutable: immutable,
  allowAddNodes: allowAddNodes,
  allowAddEdges: allowAddEdges,
  allowChangeColors: allowChangeColors,
  allowEdit: allowEdit,
  allowLabels: allowLabels,
  colorChoices: urlSearchParams.has('colorChoices') &&
    urlSearchParams.getAll('colorChoices').map(function(c) { return '#' + c; }),
  initialNodes: state.retrievePersistedNodes(),
  initialEdges: state.retrievePersistedEdges(),
});

global.graph = global.graphComponent.graph;

global.resetButton = new ResetButton(Object.assign({
  resettables: [
    global.graphComponent,
  ],
}, { actionQueue: actionQueue }));

global.graphComponent.attachTo(document.getElementById('main-graph'));
global.resetButton.attachTo(document.getElementById('reset-button'));
