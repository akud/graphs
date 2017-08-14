var ResetButton = require('../src/ResetButton');
var MockActionQueue = require('./utils/MockActionQueue');

describe('ResetButton', function() {
  var resetButton;
  var resettables;
  var targetElement;

  beforeEach(function() {
    targetElement = new MockDomNode();
    resettables = [
      createSpyObjectWith('reset'),
      createSpyObjectWith('reset'),
      createSpyObjectWith('reset'),
    ];
    resetButton = new ResetButton({
      actionQueue: new MockActionQueue(),
      resettables: resettables,
    });
    resetButton.attachTo(targetElement);
  });

  it('resets the resettables on click', function() {
    resettables.forEach(function(r) {
      expect(r.reset).toNotHaveBeenCalled();
    });
    targetElement.click();
    resettables.forEach(function(r) {
      expect(r.reset).toHaveBeenCalled();
    });
  });
});
