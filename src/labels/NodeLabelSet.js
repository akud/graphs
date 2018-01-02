var Position = require('../geometry/Position');
var EditableLabel = require('./EditableLabel');
var utils = require('../utils');
var Logger = require('../Logger');

var LOG = new Logger('NodeLabelSet');

function NodeLabelSet(opts) {
  this.componentManager = opts && opts.componentManager;
  this.state = opts && opts.state;
  this.editableLabelFactory = (opts && opts.editableLabelFactory) || EditableLabel.Factory;
  this.labels = {};
}

NodeLabelSet.prototype = {
  className: 'NodeLabelSet',
  getConstructorArgs: function() {
    return {
      componentManager: this.componentManager,
      state: this.state,
    };
  },

  initialize: function(initialData) {
    LOG.debug('initializing', initialData);
    initialData
      .filter(function(o) { return !!o.label; })
      .forEach((function(o) {
        var label = this._createLabel(o);
        this.labels[o.node.id] = label;
        label.display();
      }).bind(this));
  },

  edit: function(node) {
    LOG.debug('editing label for node ' + node.id);
    this._getOrCreateLabel(node).edit();
  },

  display: function(node) {
    LOG.debug('displaying label for node ' + node.id);
    this._getOrCreateLabel(node).display();
  },

  closeAll: function() {
    LOG.debug('closing all labels', this.labels);
    Object.values(this.labels).forEach(function(label) {
      label.remove();
    });
    this.labels = {};
  },

  _getOrCreateLabel: function(node) {
    var label;
    if (this.labels[node.id]) {
      label = this.labels[node.id];
      LOG.info('reusing existing label for node ' + node.id, label);
    } else {
      label = this._createLabel({ node: node });
      this.labels[node.id] = label;
      LOG.info('created new label for node ' + node.id, label);
    }
    return label;
  },

  _createLabel: function(opts) {
    var node = utils.requireNonNull(opts, 'node');
    var label = opts.label;
    var link = opts.link;
    LOG.debug('Creating label', node);

    return this.editableLabelFactory.create({
      text: label,
      componentManager: this.componentManager,
      pinTo: function() {
        return new Position({
          bottomRight: node.getCurrentBoundingBox().getTopLeft(),
        });
      },
      onChange: (function(text) {
        LOG.debug('saving label', node, text);
        this.state.persistNode({ id: node.id, label: text });
      }).bind(this),
      link: link,
    });
  },

  _validate: function() {
    if (!this.componentManager) {
      throw new Error('componentManager is required');
    }
    if (!this.state) {
      throw new Error('state is required');
    }
  },
};

module.exports = NodeLabelSet;
