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

    it('can be called twice in a row', function() {
      var displayComponent1 = createSpyObjectWith('close');
      var displayComponent2 = createSpyObjectWith('close');
      var insertCallCount = 0;
      componentManager.insertComponent.andCall(function() {
        return [displayComponent1, displayComponent2][(insertCallCount++)%2];
      });

      editableLabel.text = 'hello';
      editableLabel.display();
      editableLabel.display();

      expect(displayComponent1.close).toHaveBeenCalled();
      expect(displayComponent2.close).toNotHaveBeenCalled();
    });
  });

  describe('edit', function() {
    it('inserts a TextBox component with the text on the label', function() {
      editableLabel.text = 'foobar';
      editableLabel.edit();
      expect(componentManager.insertComponent).toHaveBeenCalledWith({
        class: TextBox,
        constructorArgs: {
         text: 'foobar',
         onSave: matchers.any(Function),
        },
        pinTo: pinTo,
      });
    });

    it('enters display mode when the edit component is saved', function() {
      var editComponent = createSpyObjectWith('getText', 'close');
      editComponent.getText.andReturn('edited text');
      componentManager.insertComponent.andReturn(editComponent);
      editableLabel.text = 'foobar';
      editableLabel.edit();
      expect(componentManager.insertComponent).toHaveBeenCalledWith({
        class: TextBox,
        constructorArgs: {
         text: 'foobar',
         onSave: matchers.functionThatHasSideEffect({
          before: function() {
            expect(componentManager.insertComponent).toNotHaveBeenCalledWith({
              class: BlockText,
              constructorArgs: { text: 'edited text' },
              pinTo: pinTo,
            });
          },
          after: function() {
            expect(componentManager.insertComponent).toHaveBeenCalledWith({
              class: BlockText,
              constructorArgs: { text: 'edited text' },
              pinTo: pinTo,
            });
          },
         }),
        },
        pinTo: pinTo,
      });
    });

    it('can be called twice in a row', function() {
      var editComponent1 = createSpyObjectWith('close');
      var editComponent2 = createSpyObjectWith('close');
      var insertCallCount = 0;
      componentManager.insertComponent.andCall(function() {
        return [editComponent1, editComponent2][(insertCallCount++)%2];
      });

      editableLabel.edit();
      editableLabel.edit();

      expect(editComponent1.close).toHaveBeenCalled();
      expect(editComponent2.close).toNotHaveBeenCalled();
    });

  });

  describe('close', function() {
    it('closes the display component if it was active', function() {
      var component = createSpyObjectWith('close');
      componentManager.insertComponent.andReturn(component);

      editableLabel.text = 'hello';
      editableLabel.display();

      expect(componentManager.insertComponent).toHaveBeenCalled();
      expect(component.close).toNotHaveBeenCalled();

      editableLabel.close();

      expect(component.close).toHaveBeenCalled();
    });

    it('closes the edit component if it was active', function() {
      var component = createSpyObjectWith('close');
      componentManager.insertComponent.andReturn(component);
      editableLabel.edit();

      expect(componentManager.insertComponent).toHaveBeenCalled();
      expect(component.close).toNotHaveBeenCalled();

      editableLabel.close();

      expect(component.close).toHaveBeenCalled();
    });
  });
});
