var ActionQueue = require('../src/ActionQueue');

describe('ActionQueue', function() {
  var setTimeout;
  var clearTimeout;
  var actionQueue;

  beforeEach(function() {
    setTimeout = createSpy();
    clearTimeout = createSpy();
    actionQueue = new ActionQueue({
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
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

});
