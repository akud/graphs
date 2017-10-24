var Position = require('./Position');
var EditableLabel = require('./EditableLabel');

function NodeLabelSet(opts) {
  this.componentManager = opts && opts.componentManager;
  this.state = opts && opts.state;
  this.editableLabelFactory = (opts && opts.editableLabelFactory) || EditableLabel.Factory;
  this.labels = {};
}

NodeLabelSet.prototype = {

  initialize: function(initialData) {
    initialData
      .filter(function(o) { return !!o.label; })
      .forEach((function(o) {
        this.labels[o.node.id] = this._createLabel(o.node, o.label).display();
      }).bind(this));
  },

  edit: function(node) {
    var label = this.labels[node.id] || this._createLabel(node);
    label.edit();
  },

  display: function(node) {
    var label = this.labels[node.id] || this._createLabel(node);
    label.display();
  },

  _createLabel: function(node, label) {
    return this.editableLabelFactory.create({
      text: label,
      componentManager: this.componentManager,
      pinTo: function() {
        return new Position({
          bottomRight: node.getCurrentBoundingBox().getTopLeft(),
        });
      },
      onChange: (function(text) {
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
