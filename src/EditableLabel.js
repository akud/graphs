var ModeSwitch = require('./ModeSwitch');
var BlockText = require('./BlockText');
var TextBox = require('./TextBox');
var Logger = require('./Logger');
var LOG = new Logger('EditableLabel');

function EditableLabel(opts) {
  if (opts) {
    this.componentManager = opts.componentManager;
    this.text = opts.text;
    this.pinTo = opts.pinTo;
    this.modeSwitch = new ModeSwitch({
      name: 'EditableLabel({ text: \'' + this.text + '\'})'
    });
    this.onChange = opts.onChange || function() {};
  }
}

EditableLabel.prototype = {
  className: 'EditableLabel',

  getConstructorArgs: function() {
    return {
      componentManager: this.componentManager,
      text: this.text,
      pinTo: this.pinTo,
      onChange: this.onChange,
    };
  },

  display: function() {
    LOG.debug('displaying text', this.text);
    this._validate();

    this.modeSwitch.exit('edit', (function(editState) {
      this.text = editState.component.getText();
      editState.component.remove();
      LOG.debug('got text from input component', this.text);
    }).bind(this))
    .exit('display', function(displayState) { displayState.component.remove(); });

    if (this.text) {
      this.modeSwitch.enter('display', (function() {
        var component = this.componentManager.insertComponent({
          class: BlockText,
          constructorArgs: { text: this.text },
          pinTo: this.pinTo,
        });
        this.onChange(this.text);
        LOG.debug('EditableLabel: displaying component with text', this.text);
        return { component: component };
      }).bind(this));
    }
    return this;
  },

  edit: function() {
    LOG.debug('editing text', this.text);
    this._validate();
    this.modeSwitch.exit('display', (function(displayState) {
      displayState.component.remove();
      LOG.debug('closed display component');
    }).bind(this))
    .exit('edit', function(editState) { editState.component.remove(); });

    this.modeSwitch.enter('edit', (function() {
       var component = this.componentManager.insertComponent({
        class: TextBox,
        constructorArgs: {
          text: this.text,
          onSave: this.display.bind(this),
        },
        pinTo: this.pinTo,
      });
      LOG.debug('opened edit component');
      return { component: component };
    }).bind(this));
    return this;
  },

  _validate: function() {
    if(!this.componentManager) {
      throw new Error('componentManager is required');
    }
    if(!this.modeSwitch) {
      throw new Error('modeSwitch is required');
    }
  },

  remove: function() {
    this.modeSwitch
      .exit('display', function(displayState) { displayState.component.remove(); })
      .exit('edit', function(editState) { editState.component.remove(); }) ;
    return this;
  },

  _closeComponent: function(state) {
    state.component.remove();
  },
};

EditableLabel.Factory = {
  create: function(opts) { return new EditableLabel(opts); },

};
module.exports = EditableLabel;
