var graphelements = require('./graphelements');;
var utils = require('./utils');
var LOG = require('./Logger');


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
    var originalTarget = event.explicitOriginalTarget;
    if (originalTarget && originalTarget.nodeName == 'circle') {
      return this._getTargetNode(event);
    } else {
      return graphelements.NONE;
    }
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
    var nodes = this.graph.getNodesByFn(function(node) {
      return x >= node.x && x <= node.x + node.width &&
             y >= node.y && y <= node.y + node.height;
    });

    if (nodes.length === 0) {
      LOG.warn('no nodes at (' + x + ',' + y + ')');
      return graphelements.NONE;
    } else if (nodes.length > 1) {
      LOG.debug('multiple nodes at (' + x + ',' + y + ')', nodes);
    }
    return new graphelements.Node({
      id: nodes[0].id,
      realNode: nodes[0],
      domElement: event.explicitOriginalTarget,
    });
  }
};


module.exports = GreulerAdapter;
