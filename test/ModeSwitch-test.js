var ModeSwitch = require('../src/ModeSwitch');
var MockActionQueue = require('./utils/MockActionQueue');

describe('ModeSwitch', function() {
  var modeSwitch;
  var actionQueue;

  beforeEach(function() {
    actionQueue = new MockActionQueue();
    modeSwitch = new ModeSwitch({
      actionQueue: actionQueue,
      timeout: 10,
    });
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

    it('cancels mode reset', function() {
      var barAction = createSpy();
      modeSwitch.enter('foo');
      actionQueue.step(5);
      modeSwitch.enter('foo');
      actionQueue.step(5);
      modeSwitch.enter('bar', barAction);
      expect(barAction).toNotHaveBeenCalled();
    });

    it('stores the return value of enter function to pass to exit function', function() {
      var modeState = { hello: 'world' };
      var enterAction = createSpy().andReturn(modeState);
      var exitAction = createSpy();
      modeSwitch.enter('foo', enterAction);
      modeSwitch.exit('foo', exitAction);
      expect(exitAction).toHaveBeenCalledWith(modeState);
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

    it('resets the mode after timeout', function() {
      var barAction = createSpy();
      modeSwitch.enter('foo');
      modeSwitch.exit('foo');

      modeSwitch.enter('bar', barAction);
      expect(barAction).toNotHaveBeenCalled();

      actionQueue.step(10);
      modeSwitch.enter('bar', barAction);

      expect(barAction).toHaveBeenCalled();
    });

    it('cancels previously scheduled mode reset', function() {
      var barAction = createSpy();
      modeSwitch.enter('foo');
      modeSwitch.exit('foo');

      actionQueue.step(5);
      modeSwitch.exit('foo');
      actionQueue.step(5);
      modeSwitch.enter('bar', barAction);

      expect(barAction).toNotHaveBeenCalled();
    });

    it('immediately resets mode if no timeout is specified', function() {
      modeSwitch = new ModeSwitch();
      var barAction = createSpy();
      modeSwitch.enter('foo');
      modeSwitch.exit('foo');

      modeSwitch.enter('bar', barAction);
      expect(barAction).toHaveBeenCalled();
    });
  });

  describe('if active', function() {

    it('does not perform the action if no mode is active', function() {
      var action = createSpy();
      modeSwitch.ifActive({ foo: action });
      expect(action).toNotHaveBeenCalled();
    });

    it('does not performs the action if another mode is active', function() {
      var action = createSpy();
      modeSwitch
        .enter('bar')
        .ifActive({ foo: action });
      expect(action).toNotHaveBeenCalled();
    });

    it('performs the action if the mode is active', function() {
      var action = createSpy();
      modeSwitch.enter('foo');
      modeSwitch.ifActive({ foo: action });
      expect(action).toHaveBeenCalled();
    });

    it('ignores the other actions', function() {
      var fooAction = createSpy();
      var barAction = createSpy();
      modeSwitch.enter('foo');
      modeSwitch.ifActive({
        foo: fooAction,
        bar: barAction,
      });
      expect(fooAction).toHaveBeenCalled();
      expect(barAction).toNotHaveBeenCalled();
    });

    it('passes mode state to the action', function() {
      var action = createSpy();
      modeSwitch
        .enter('foo', function() { return { a: 'b' }; })
        .ifActive({ foo: action });

      expect(action).toHaveBeenCalledWith({ a: 'b' });
    });

    it('does not set action return value as state', function() {
      var action = createSpy();
      modeSwitch
        .enter('foo', function() { return { original: 'state' }; })
        .ifActive({ foo: function() { return { a: 'b' }; } })
        .exit('foo', action);

      expect(action).toHaveBeenCalledWith({ original: 'state' });
    });

    it('does not enter the mode', function() {
      var barAction = createSpy();
      modeSwitch
        .ifActive({ foo: function() {} })
        .enter('bar', barAction);
      expect(barAction).toHaveBeenCalled();
    });

    it('does not exit the mode', function() {
      var barAction = createSpy();
      modeSwitch
        .enter('foo')
        .ifActive({ foo: function() {} })
        .enter('bar', barAction);
      expect(barAction).toNotHaveBeenCalled();

      actionQueue.step(10);
      modeSwitch.enter('bar', barAction);
      expect(barAction).toNotHaveBeenCalled();
    });
  });
});
