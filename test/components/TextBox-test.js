var TextBox = require('../../src/components/TextBox');
var MockActionQueue = require('../test_utils/MockActionQueue');
var MockDomNode = require('../test_utils/MockDomNode');

describe('TextBox', function() {

  describe('getGeneratedMarkup', function() {

    it('returns an input with initial text', function() {
      var component = new TextBox({ text: 'hello' });
      expect(component.getGeneratedMarkup()).toEqual(
        '<input type="text" value="hello"></input>'
      );
    });

    it('returns an input with no initial text', function() {
      var component = new TextBox();
      expect(component.getGeneratedMarkup()).toEqual(
        '<input type="text" value=""></input>'
      );
    });
  });

  describe('getText', function() {
    var component;
    var mainElement;
    var inputElement;
    beforeEach(function() {
      component = new TextBox({
        actionQueue: new MockActionQueue(),
      });
      inputElement = new MockDomNode();
      mainElement = new MockDomNode({
        'getElementsByTagName.returnValue': [inputElement],
      });
      component.attachTo(mainElement);
    });

    it('returns the value of the input element', function() {
      inputElement.value = 'foobar';
      expect(component.getText()).toEqual('foobar');
      expect(mainElement.getElementsByTagName).toHaveBeenCalledWith('input');
    });
  });
});
