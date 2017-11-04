var ModeSwitch = require('./ModeSwitch');
var colors = require('./colors');
var Logger = require('./Logger');
var LOG = new Logger('EditMode');


function EditMode(opts) {
  this.adapter = opts && opts.adapter;
  this.animator = opts && opts.animator;
  this.alternateInterval = (opts && opts.alternateInterval) || 250;
  this.labelSet = opts && opts.labelSet;
  this.modeSwitch = (opts && opts.modeSwitch) || new ModeSwitch({
    name: 'editMode',
  });
  this.modeSwitch.enter('display');
}


EditMode.prototype = {

  activate: function(node) {
    LOG.info('activating');
    this._validate();
    this.modeSwitch
      .exit('display')
      .exit('edit', this._cleanUpEditState.bind(this))
      .enter('edit', (function() {
        var otherNodes = this.adapter.getNodes(function(n) {
          return n.id !== node.id;
        });
        var originalColors = otherNodes.reduce(function(accum, node) {
          accum[node.id] = node.color;
          return accum;
        }, {});

        var animation = this.animator
          .alternate(
            this._setNeon.bind(this, otherNodes),
            this._setOriginalColors.bind(this, otherNodes, originalColors)
          )
          .every(this.alternateInterval)
          .play();

        this.labelSet.edit(node);

        var editState = {
          node: node,
          animation: animation,
          otherNodes: otherNodes,
          originalColors: originalColors,
        };
        LOG.debug('activated', editState);
        return editState;
      }).bind(this));
  },

  deactivate: function() {
    LOG.debug('deactvating');
    this._validate();
    this.modeSwitch
      .exit('edit', this._cleanUpEditState.bind(this))
      .enter('display', function() {
        LOG.debug('deactvated');
      });
  },

  perform: function(opts) {
    opts = Object.assign({
      ifActive: function() {},
      ifNotActive: function() {},
    }, opts);
    this._validate();

    this.modeSwitch.ifActive({
      edit: function(editState) { opts.ifActive(editState.node); },
      display: opts.ifNotActive,
    });
  },

  _setNeon: function(otherNodes) {
    otherNodes.forEach((function(n) {
      this.adapter.setNodeColor(n, colors.NEON);
    }).bind(this));
  },

  _setOriginalColors: function(otherNodes, originalColors) {
    otherNodes.forEach((function(n) {
      this.adapter.setNodeColor(n, originalColors[n.id]);
    }).bind(this));
  },

  _cleanUpEditState: function(editState) {
    LOG.debug('cleaning up edit mode state', editState);
    editState.animation.stop();
    this.labelSet.display(editState.node);
    this._setOriginalColors(editState.otherNodes, editState.originalColors);
  },

  _validate: function() {
    if (!this.adapter) {
      throw new Error('adapter is required');
    }
    if (!this.animator) {
      throw new Error('animator is required');
    }
    if (!this.modeSwitch) {
      throw new Error('modeSwitch is required');
    }
  }

};

module.exports = EditMode;
