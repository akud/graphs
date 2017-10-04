var ActionQueue = require('../src/ActionQueue');

describe('ActionQueue', function() {
  var setTimeout;
  var clearTimeout;
  var actionQueue;
  var actionInterval;

  beforeEach(function() {
    setTimeout = createSpy();
    clearTimeout = createSpy();
    actionInterval = 10;
    actionQueue = new ActionQueue({
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      actionInterval: actionInterval,
    });
  });

  describe('defer', function() {
    it('delegates to setTimeout', function() {
      var fn = function() { };
      actionQueue.defer(23, fn);
      expect(setTimeout).toHaveBeenCalledWith(fn, 23);
    });

    it('accepts only one argument', function() {
      var fn = function() { };
      actionQueue.defer(fn);
      expect(setTimeout).toHaveBeenCalledWith(fn, 1);
    });

    it('returns an object that can cancel itself', function() {
      setTimeout.andReturn(23463);
      var future = actionQueue.defer(function() { });
      expect(future).toBeAn(Object);
      expect(future.cancel).toBeA(Function);
      expect(clearTimeout).toNotHaveBeenCalled();

      future.cancel();

      expect(clearTimeout).toHaveBeenCalledWith(23463);
    });
  });

  describe('periodically', function() {
    it('starts a queue of periodic actions if one has not been started yet', function() {
      var fn = createSpy();
      actionQueue.periodically(fn);

      expect(fn.calls.length).toEqual(1);
      expect(setTimeout.calls.length).toEqual(1);

      setTimeout.calls[0].arguments[0]();
      expect(fn.calls.length).toEqual(2);
      expect(setTimeout.calls.length).toEqual(2);


      setTimeout.calls[1].arguments[0]();
      expect(fn.calls.length).toEqual(3);
      expect(setTimeout.calls.length).toEqual(3);
    });

    it('adds new actions to the existing queue', function() {
      var fn1 = createSpy();
      var fn2 = createSpy();
      actionQueue.periodically(fn1);
      actionQueue.periodically(fn2);

      expect(fn1.calls.length).toEqual(1);
      expect(fn2.calls.length).toEqual(0);
      expect(setTimeout.calls.length).toEqual(1);

      setTimeout.calls[0].arguments[0]();
      expect(fn1.calls.length).toEqual(2);
      expect(fn2.calls.length).toEqual(1);
      expect(setTimeout.calls.length).toEqual(2);


      setTimeout.calls[1].arguments[0]();
      expect(fn1.calls.length).toEqual(3);
      expect(fn2.calls.length).toEqual(2);
      expect(setTimeout.calls.length).toEqual(3);
    });

    it('returns objects that can cancel themselves', function() {
      var fn1 = createSpy();
      var fn2 = createSpy();
      var tracker1 = actionQueue.periodically(fn1);
      var tracker2 = actionQueue.periodically(fn2);

      expect(fn1.calls.length).toEqual(1);
      expect(fn2.calls.length).toEqual(0);
      expect(setTimeout.calls.length).toEqual(1);

      setTimeout.calls[0].arguments[0]();
      expect(fn1.calls.length).toEqual(2);
      expect(fn2.calls.length).toEqual(1);
      expect(setTimeout.calls.length).toEqual(2);

      tracker2.cancel();


      setTimeout.calls[1].arguments[0]();
      expect(fn1.calls.length).toEqual(3);
      expect(fn2.calls.length).toEqual(1);
      expect(setTimeout.calls.length).toEqual(3);
    });
  });
});
