var ModeSwitch = require('../ModeSwitch');
var BlockText = require('../components/BlockText');
var Link = require('../components/Link');
var TextBox = require('../components/TextBox');
var utils = require('../utils');
var Logger = require('../Logger');

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
    this.link = opts.link;
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
      link: this.link,
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
          class: this.link ? Link : BlockText,
          constructorArgs: utils.optional({ text: this.text, link: this.link }),
          pinTo: this.pinTo,
        });
        this.onChange(this.text);
        LOG.debug(
          'displaying component text=\'' + this.text + '\'' +
          (this.link ? ', link=\'' + this.link + '\'' : '')
        );
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
    LOG.debug('removing', this);
    this.modeSwitch
      .exit('display', function(displayState) {
        displayState.component.remove();
        LOG.debug('closed display component');
      })
      .exit('edit', function(editState) {
        editState.component.remove();
        LOG.debug('closed edit component');
      }) ;
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
