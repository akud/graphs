var ModeSwitch = require('../src/ModeSwitch');

describe('ModeSwitch', function() {
  var modeSwitch;

  beforeEach(function() {
    modeSwitch = new ModeSwitch();
  });

  describe('mode.enter', function() {
    it('calls action if no mode is active', function() {
      var action = createSpy();
      modeSwitch.enter('foo', action);
      expect(action).toHaveBeenCalled();
    });

    it('calls the action if mode is currently active', function() {
      var action1 = createSpy();
      var action2 = createSpy();
      modeSwitch.enter('foo', action1);
      modeSwitch.enter('foo', action2);
      expect(action1).toHaveBeenCalled();
      expect(action2).toHaveBeenCalled();
    });

    it('does not enter mode if another mode is active', function() {
      var fooAction = createSpy();
      var barAction = createSpy();
      modeSwitch.enter('foo', fooAction);
      modeSwitch.enter('bar', barAction);
      expect(fooAction).toHaveBeenCalled();
      expect(barAction).toNotHaveBeenCalled();
    });
  });

  describe('mode.exit', function() {
    it('calls the action if the mode is active', function() {
      var action = createSpy();
      modeSwitch.enter('foo');
      modeSwitch.exit('foo', action);
      expect(action).toHaveBeenCalled();
    });

    it('does not call the action if the mode is not active', function() {
      var fooAction = createSpy();
      modeSwitch.enter('bar');
      modeSwitch.exit('foo', fooAction);
      expect(fooAction).toNotHaveBeenCalled();
    });

    it('does not exit if the mode is not active', function() {
      var barAction = createSpy();
      var fooAction = createSpy();
      modeSwitch.enter('bar');
      modeSwitch.exit('foo');

      modeSwitch.enter('foo', fooAction);
      modeSwitch.enter('bar', barAction);

      expect(fooAction).toNotHaveBeenCalled();
      expect(barAction).toHaveBeenCalled();
    });
  });
});