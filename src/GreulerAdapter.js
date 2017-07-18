var clicktargets = require('./clicktargets');;
var LOG = require('./Logger');


function GreulerAdapter(greuler) {
  this.greuler = greuler;
}


GreulerAdapter.prototype = {
  initialize: function(targetNode, options) {
    options = options || {};
    var greulerOptions = {
      target: '#' + targetNode.id,
    };
    if (options.width) {
      greulerOptions.width = options.width;
    }
    if (options.height) {
      greulerOptions.height = options.height;
    }

    this.instance = this.greuler(greulerOptions).update();
    this.graph = this.instance.graph;
  },

  addNode: function(node) {
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
