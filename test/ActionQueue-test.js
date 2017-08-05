var ActionQueue = require('../src/ActionQueue');

describe('ActionQueue', function() {
  var setTimeout;
  var actionQueue;

  beforeEach(function() {
    setTimeout = createSpy();
    actionQueue = new ActionQueue({ setTimeout: setTimeout });
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
  });

});
