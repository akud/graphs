var clicktargets = require('./clicktargets');;
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
    var node = utils.optional({
      id: node.id,
      fill: node.color,
      label: node.label || '',
      r: node.size,
    }, { force: ['id', 'label'] });
    var result = this.graph.addNode(node);
    this.instance.update();
  },

  setNodeColor: function(target, color) {
    if (target.domElement) {
      target.domElement.setAttribute('fill', color);
    } else if (target.id) {
      //TODO: retrieve dom node for node id
    } else {
      LOG.error('Got unexpected target node', target);
    }
  },

  getClickTarget: function(event) {
    var originalTarget = event.explicitOriginalTarget;
    if (originalTarget && originalTarget.nodeName == 'circle') {
      return this._getTargetNode(event);
    } else {
      return clicktargets.NONE;
    }
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
      return clicktargets.NONE;
    } else if (nodes.length > 1) {
      LOG.debug('multiple nodes at (' + x + ',' + y + ')', nodes);
    }
    return new clicktargets.Node({
      id: nodes[0].id,
      realNode: nodes[0],
      domElement: event.explicitOriginalTarget,
    });
  }
};


module.exports = GreulerAdapter;
