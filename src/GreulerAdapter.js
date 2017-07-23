var graphelements = require('./graphelements');;
var utils = require('./utils');
var LOG = require('./Logger');

var NODE_AREA_FUZZ_FACTOR = 0.1;


function GreulerAdapter(greuler) {
  this.greuler = greuler;
}


GreulerAdapter.prototype = {
  initialize: function(targetNode, options) {
    this.instance = this.greuler(utils.optional({
      target: '#' + targetNode.id,
      width: (options && options.width),
      height: (options && options.height),
      r: (options && options.size),
    })).update();
    this.graph = this.instance.graph;
  },

  addNode: function(node) {
    node = utils.optional({
      id: node.id,
      fill: node.color,
      label: node.label || '',
      r: node.size,
    }, { force: ['id', 'label'] });
    var result = this.graph.addNode(node);
    this.instance = this.instance.update();
  },

  setNodeColor: function(target, color) {
    if (target.domElement) {
      target.domElement.setAttribute('fill', color);
    } else if (target.id) {
      var node = this.graph.getNode({ id: target.id });
      this._getDomElement(node).setAttribute('fill', color);
    } else {
      LOG.error('Got unexpected target node', target);
    }
  },

  getClickTarget: function(event) {
    return this._getTargetNode(event) || graphelements.NONE;
  },

  getNodes: function(filter) {
    filter = filter || function() { return true; };
    return this.graph.getNodesByFn(filter).map((function(node) {
      return new graphelements.Node({
        id: node.id,
        realNode: node,
        domElement: this._getDomElement(node),
      });
    }).bind(this));
  },

  _getDomElement: function(node) {
    return this.instance.nodeGroup[0][0]
      .childNodes[node.index]
      .getElementsByTagName('circle')[0];
  },

  _getTargetNode: function(event) {
    var x = event.clientX;
    var y = event.clientY;
    var matchingNodes = this.getNodes(function(node) {
      var leftBound = node.x - (NODE_AREA_FUZZ_FACTOR * node.width);
      var rightBound = node.x + (( 1+ NODE_AREA_FUZZ_FACTOR) * node.width);
      var topBound = node.y - (NODE_AREA_FUZZ_FACTOR * node.height);
      var bottomBound = node.y + ((1 + NODE_AREA_FUZZ_FACTOR) * node.height);
      return leftBound <= x && x <= rightBound &&
             topBound <= y && y <= bottomBound;
    });

    if (matchingNodes && matchingNodes.length) {
      matchingNodes.sort(function(a, b) {
        var distanceToA = utils.distance(center(a.realNode), [x, y]);
        var distanceToB = utils.distance(center(b.realNode), [x, y]);
        return distanceToA - distanceToB;
      });
      return matchingNodes[0];
    } else {
      return undefined;
    }
  }
};


function center(node) {
    return [node.x + (node.width / 2), node.y + (node.height / 2)];
}

module.exports = GreulerAdapter;
