var ModeSwitch = require('./ModeSwitch');
var BlockText = require('./BlockText');
var TextBox = require('./TextBox');

function EditableLabel(opts) {
  if (opts) {
    this.componentManager = opts.componentManager;
    this.text = opts.text;
    this.pinTo = opts.pinTo;
    this.modeSwitch = new ModeSwitch();
    this.onChange = opts.onChange || function() {};
  }
}

EditableLabel.prototype = {
  display: function() {
    this._validate();

    this.modeSwitch.exit('edit', (function() {
      this.text = this.editComponent.getText();
      this.editComponent.remove();
      this.editComponent = null;
    }).bind(this));

    if (this.text) {
      this.modeSwitch.enter('display', (function() {
        this.displayComponent = this.componentManager.insertComponent({
          class: BlockText,
          constructorArgs: { text: this.text },
          pinTo: this.pinTo,
        });
        this.onChange(this.text);
      }).bind(this));
    }
    return this;
  },

  edit: function() {
    this._validate();
    this.modeSwitch.exit('display', (function() {
      this.text = this.displayComponent.getText();
      this.displayComponent.remove();
      this.displayComponent = null;
    }).bind(this));

    this.modeSwitch.enter('edit', (function() {
      this.editComponent = this.componentManager.insertComponent({
        class: TextBox,
        constructorArgs: { text: this.text },
        pinTo: this.pinTo,
      });
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
};

module.exports = EditableLabel;
