var Position = require('./Position');
var EditableLabel = require('./EditableLabel');
var Logger = require('./Logger');
var LOG = new Logger('NodeLabelSet');

function NodeLabelSet(opts) {
  this.componentManager = opts && opts.componentManager;
  this.state = opts && opts.state;
  this.editableLabelFactory = (opts && opts.editableLabelFactory) || EditableLabel.Factory;
  this.labels = {};
}

NodeLabelSet.prototype = {

  initialize: function(initialData) {
    LOG.debug('initializing', initialData);
    initialData
      .filter(function(o) { return !!o.label; })
      .forEach((function(o) {
        var label = this._createLabel(o.node, o.label);
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
      label = this._createLabel(node);
      this.labels[node.id] = label;
      LOG.info('created new label for node ' + node.id, label);
    }
    return label;
  },

  _createLabel: function(node, label) {
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
