var EditableLabel = require('../../src/labels/EditableLabel');
var BlockText = require('../../src/components/BlockText');
var Link = require('../../src/components/Link');
var TextBox = require('../../src/components/TextBox');

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

    it('inserts a Link component if the label has text and a link', function() {
      editableLabel.text = 'hello';
      editableLabel.link = '/foobar/';
      editableLabel.display();
      expect(componentManager.insertComponent).toHaveBeenCalledWith({
        class: Link,
        constructorArgs: { text: 'hello', link: '/foobar/' },
        pinTo: pinTo,
      });
    });

    it('takes the text from edit component and displays it', function() {
      var editComponent = createSpyObjectWith('getText', 'remove');
      editComponent.getText.andReturn('edited text');
      componentManager.insertComponent.andReturn(editComponent);
      editableLabel.edit().display();
      expect(componentManager.insertComponent).toHaveBeenCalledWith({
        class: BlockText,
        constructorArgs: { text: 'edited text' },
        pinTo: pinTo,
      });
      expect(editComponent.remove).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledWith({ text: 'edited text', link: null });
    });

    it('parses a link from the edit component text', function() {
      var editComponent = createSpyObjectWith('getText', 'remove');
      editComponent.getText.andReturn('[hello](google.com)');
      componentManager.insertComponent.andReturn(editComponent);
      editableLabel.edit().display();
      expect(componentManager.insertComponent).toHaveBeenCalledWith({
        class: Link,
        constructorArgs: { text: 'hello', link: 'google.com' },
        pinTo: pinTo,
      });
      expect(editComponent.remove).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledWith({ text: 'hello', link: 'google.com' });
    });

    it('can be called twice in a row', function() {
      var displayComponent1 = createSpyObjectWith('remove');
      var displayComponent2 = createSpyObjectWith('remove');
      var insertCallCount = 0;
      componentManager.insertComponent.andCall(function() {
        return [displayComponent1, displayComponent2][(insertCallCount++)%2];
      });

      editableLabel.text = 'hello';
      editableLabel.display();
      editableLabel.display();

      expect(displayComponent1.remove).toHaveBeenCalled();
      expect(displayComponent2.remove).toNotHaveBeenCalled();
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

    it('displays a link in markdown format', function() {
      editableLabel.text = 'foobar';
      editableLabel.link = 'google.com';
      editableLabel.edit();
      expect(componentManager.insertComponent).toHaveBeenCalledWith({
        class: TextBox,
        constructorArgs: {
         text: '[foobar](google.com)',
         onSave: matchers.any(Function),
        },
        pinTo: pinTo,
      });
    });

    it('enters display mode when the edit component is saved', function() {
      var editComponent = createSpyObjectWith('getText', 'remove');
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
      var editComponent1 = createSpyObjectWith('remove');
      var editComponent2 = createSpyObjectWith('remove');
      var insertCallCount = 0;
      componentManager.insertComponent.andCall(function() {
        return [editComponent1, editComponent2][(insertCallCount++)%2];
      });

      editableLabel.edit();
      editableLabel.edit();

      expect(editComponent1.remove).toHaveBeenCalled();
      expect(editComponent2.remove).toNotHaveBeenCalled();
    });

  });

  describe('remove', function() {
    it('closes the display component if it was active', function() {
      var component = createSpyObjectWith('remove');
      componentManager.insertComponent.andReturn(component);

      editableLabel.text = 'hello';
      editableLabel.display();

      expect(componentManager.insertComponent).toHaveBeenCalled();
      expect(component.remove).toNotHaveBeenCalled();

      editableLabel.remove();

      expect(component.remove).toHaveBeenCalled();
    });

    it('closes the edit component if it was active', function() {
      var component = createSpyObjectWith('remove');
      componentManager.insertComponent.andReturn(component);
      editableLabel.edit();

      expect(componentManager.insertComponent).toHaveBeenCalled();
      expect(component.remove).toNotHaveBeenCalled();

      editableLabel.remove();

      expect(component.remove).toHaveBeenCalled();
    });
  });
});
