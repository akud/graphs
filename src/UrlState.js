var utils = require('./utils');

NUM_NODES_PARAM = 'n'
COLOR_PARAM_PREFIX = 'c_';
EDGE_PARAM_PREFIX = 'e_';

function UrlState(options) {
  this.baseUrl = (options && options.baseUrl);
  this.setUrl = (options && options.setUrl);
  this.urlSearchParams = (options && options.urlSearchParams);
}

UrlState.prototype = {
  /**
   * Perist a node and return its id
   */
  persistNode: function(options) {
    var nodeId = this._getNumNodes();
    this.urlSearchParams.set(NUM_NODES_PARAM, nodeId + 1);
    this._persistState();
    if (options && options.color) {
      this.persistNodeColor(nodeId, options.color);
    }

    return nodeId;
  },

  persistNodeColor: function(nodeId, color) {
    var bit = this._idToBit(nodeId);

    this._getColorKeys().forEach((function(key) {
      if (this._isColor({ bit: bit, colorKey: key })) {
        this._removeColor({ bit: bit, colorKey: key });
      }
    }).bind(this));

    this._setColor({ bit: bit, color: color });
    this._persistState();
  },

  persistEdge: function(sourceId, targetId) {
    var param = EDGE_PARAM_PREFIX + sourceId;
    var bitmask;
    if (this.urlSearchParams.has(param)) {
      bitmask = this._getBitmaskParam(param) | this._idToBit(targetId);
    } else {
      bitmask = this._idToBit(targetId);
    }
    this._setBitmaskParam(param, bitmask);
    this._persistState();
  },

  retrievePersistedNodes: function() {
    var nodes = [];
    if (this.urlSearchParams.has(NUM_NODES_PARAM)) {
      var colorParams = this._getColorKeys();
      for (var i = 0 ; i < this.urlSearchParams.get(NUM_NODES_PARAM); i++) {
        var nodeBit = this._idToBit(i);
        var nodeColor = colorParams.find((function(param) {
          return this._isColor({ bit: nodeBit, colorKey: param });
        }).bind(this));
        nodes.push(utils.optional({
          id: i,
          color: (nodeColor && nodeColor.replace(COLOR_PARAM_PREFIX, '#')),
        }, { force: 'id' }));
      }
    }
    return nodes;
  },

  retrievePersistedEdges: function() {
    return this._getEdgeKeys().map((function(key) {
      var sourceId = parseInt(key.replace(EDGE_PARAM_PREFIX, ''));
      var edges = [];
      var bitmask = this._getBitmaskParam(key);
      var maxId = bitmask.toString(2).length;
      for (var targetId = 0; targetId < maxId; targetId++) {
        var bit = this._idToBit(targetId);
        if ((bitmask & bit) === bit) {
          edges.push({ source: sourceId, target: targetId });
        }
      }
      return edges;
    }).bind(this))
    .reduce(function(a, b) { return a.concat(b); }, []);
  },

  getUrl: function() {
    return this.baseUrl + '?' + this.urlSearchParams.toString();
  },

  _isColor: function(options) {
    options = this._normalizeColorOptions(options);

    if (this.urlSearchParams.has(options.colorKey)) {
      return (this._getBitmaskParam(options.colorKey) & options.bit) === options.bit;
    } else {
      return false;
    }
  },

  _setColor: function(options) {
    options = this._normalizeColorOptions(options);
    var bitmask;

    if (this.urlSearchParams.has(options.colorKey)) {
      bitmask = this._getBitmaskParam(options.colorKey) | options.bit;
    } else {
      bitmask = options.bit;
    }
    this._setBitmaskParam(options.colorKey, bitmask);
  },

  _removeColor: function(options) {
    options = this._normalizeColorOptions(options);
    if (!this.urlSearchParams.has(options.colorKey)) {
      throw Error('Attempted to remove color ' + options.colorKey);
    }
    var bitmask = this._getBitmaskParam(options.colorKey) & (~options.bit);
    if (bitmask === 0) {
      this.urlSearchParams.delete(options.colorKey);
    } else {
      this._setBitmaskParam(options.colorKey, bitmask);
    }
  },

  _getBitmaskParam: function(key) {
    return parseInt(this.urlSearchParams.get(key), 16);
  },

  _setBitmaskParam: function(key, value) {
    this.urlSearchParams.set(key, value.toString(16));
  },

  _idToBit: function(id) {
    if (id <= 30) {
      return 1 << id;
    } else {
      return Math.pow(2, id);
    }
  },

  _normalizeColorOptions: function(options) {
    if (!options.hasOwnProperty('bit') && !options.hasOwnProperty('nodeId')) {
      throw Error('bit or nodeId is required');
    }
    if (!options.hasOwnProperty('color') && !options.hasOwnProperty('colorKey')) {
      throw Error('color or colorKey is required');
    }
    var bit = options.hasOwnProperty('bit')
      ? options.bit
      : this._idToBit(options.nodeId);
    var colorKey = options.hasOwnProperty('colorKey')
      ? options.colorKey
      : options.color.replace('#', COLOR_PARAM_PREFIX);
    return { bit: bit, colorKey: colorKey };
  },

  _getColorKeys: function() {
    return this._getKeys(function(k) {
      return k.startsWith(COLOR_PARAM_PREFIX);
    });
  },

  _getEdgeKeys: function() {
    return this._getKeys(function(k) {
      return k.startsWith(EDGE_PARAM_PREFIX);
    });
  },

  _getKeys: function(predicate) {
    var keys = [];
    var iterator = this.urlSearchParams.keys();
    var next = iterator.next();
    while (!next.done) {
      if (predicate(next.value)) {
        keys.push(next.value);
      }
      next = iterator.next();
    }
    return keys;
  },

  _getNumNodes: function() {
    if (this.urlSearchParams.has(NUM_NODES_PARAM)) {
      return parseInt(this.urlSearchParams.get(NUM_NODES_PARAM));
    } else {
      return 0;
    }
  },

  _persistState: function() {
    this.setUrl(this.getUrl());
  },
};

module.exports = UrlState;