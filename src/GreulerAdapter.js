var graphelements = require('./graphelements');;
var utils = require('./utils');
var BoundingBox = require('./BoundingBox');
var LOG = require('./Logger');


function GreulerAdapter(greuler) {
  this.greuler = greuler;
  this.isInBulkOperation = false;
}


GreulerAdapter.prototype = {
  initialize: function(targetNode, options) {
    options = options || {};
    this.instance = this.greuler(utils.optional({
      target: '#' + targetNode.id,
      width: options.width,
      height: options.height,
      data: utils.optional({
        nodes: (options.nodes && options.nodes.map(this._translateNodeObj)),
        links: options.edges,
        linkDistance: options.edgeDistance && function() {
          return options.edgeDistance;
        },
      }),
    })).update();
    this.graph = this.instance.graph;
  },

  addNode: function(node) {
    var result = this.graph.addNode(this._translateNodeObj(node));
    this._updateInstance();
  },

  removeNode: function(node) {
    var result = this.graph.removeNode(this._translateNodeObj(node));
    this._updateInstance();
  },

  addEdge: function(options) {
    var result = this.graph.addEdge(utils.optional({
      source: options.source.id,
      target: options.target.id,
      linkDistance: options.distance,
    }, { force: ['source', 'target'] }));
    this._updateInstance();
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

  getClickTarget: function(event, nodeAreaFuzzFactor) {
    return this._getTargetNode(event, nodeAreaFuzzFactor) || graphelements.NONE;
  },

  getNodes: function(filter) {
    filter = filter || function() { return true; };
    return this.graph.getNodesByFn(filter).map((function(node) {
      var domElement = this._getDomElement(node);
      return new graphelements.Node({
        id: node.id,
        realNode: node,
        domElement: domElement,
        color: domElement.getAttribute('fill'),
      });
    }).bind(this));
  },

  performInBulk: function(actions) {
    this.isInBulkOperation = true;
    actions(this);
    this.isInBulkOperation = false;
    this._updateInstance();
  },

  _translateNodeObj: function(node) {
    return utils.optional({
      id: node.id,
      fill: node.color,
      label: node.label || '',
      r: node.size,
    }, { force: ['id', 'label'] });
  },

  _getDomElement: function(node) {
    return this.instance.nodeGroup[0][0]
      .childNodes[node.index]
      .getElementsByTagName('circle')[0];
  },

  _getTargetNode: function(event, nodeAreaFuzzFactor) {
    nodeAreaFuzzFactor = nodeAreaFuzzFactor || 0;
    var graphElementBounds = this.instance.root[0][0].getBoundingClientRect();
    var point = {
      x: event.clientX,
      y: event.clientY,
    };
    var matchingNodes = this.getNodes(function(node) {
      return new BoundingBox({
        left: node.bounds.x,
        right: node.bounds.X,
        top: node.bounds.y,
        bottom: node.bounds.Y
      })
        .expandBy(nodeAreaFuzzFactor)
        .translate({ x: graphElementBounds.left, y: graphElementBounds.top })
        .contains(point);
    });

    if (matchingNodes && matchingNodes.length) {
      matchingNodes.sort(function(a, b) {
        var distanceToA = utils.distance(center(a.realNode), point);
        var distanceToB = utils.distance(center(b.realNode), point);
        return distanceToA - distanceToB;
      });
      return matchingNodes[0];
    } else {
      return undefined;
    }
  },

  _updateInstance: function() {
    if (!this.isInBulkOperation) {
      this.instance = this.instance.update();
    }
  },
};


function center(node) {
  var width = node.bounds.X - node.bounds.x;
  var height = node.bounds.Y - node.bounds.y;
  return {
    x: node.bounds.x + (width / 2),
    y: node.bounds.y + (height / 2),
  };
}

module.exports = GreulerAdapter;
