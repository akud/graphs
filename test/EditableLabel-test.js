var EditableLabel = require('../src/EditableLabel');
var BlockText = require('../src/BlockText');
var TextBox = require('../src/TextBox');

describe('EditableLabel', function() {

  var componentManager;
  var pinTo;
  var onChange;
  var editableLabel;

  beforeEach(function() {
    componentManager = createSpyObjectWith('insertComponent');
    pinTo = createSpy();
    onChange = createSpy();
    editableLabel = new EditableLabel({
      componentManager: componentManager,
      pinTo: pinTo,
      onChange: onChange,
    });
  });

  describe('display', function() {
    it('does nothing if the label has no text', function() {
      editableLabel.text = null;
      editableLabel.display();
      expect(componentManager.insertComponent).toNotHaveBeenCalled();
    });

    it('inserts a BlockText component if the label has text', function() {
      editableLabel.text = 'hello';
      editableLabel.display();
      expect(componentManager.insertComponent).toHaveBeenCalledWith({
        class: BlockText,
        constructorArgs: { text: 'hello' },
        pinTo: pinTo,
      });
    });

    it('takes the text from edit component and displays it', function() {
      var editComponent = createSpyObjectWith('getText', 'close');
      editComponent.getText.andReturn('edited text');
      componentManager.insertComponent.andReturn(editComponent);
      editableLabel.edit().display();
      expect(componentManager.insertComponent).toHaveBeenCalledWith({
        class: BlockText,
        constructorArgs: { text: 'edited text' },
        pinTo: pinTo,
      });
      expect(editComponent.close).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledWith('edited text');
    });
  });

  describe('edit', function() {
    it('inserts a TextBox component with the text on the label', function() {
      editableLabel.text = 'foobar';
      editableLabel.edit();
      expect(componentManager.insertComponent).toHaveBeenCalledWith({
        class: TextBox,
        constructorArgs: { text: 'foobar' },
        pinTo: pinTo,
      });
    });
  });
});
