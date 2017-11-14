var Animator = require('../src/Animator');
var MockActionQueue = require('./test_utils/MockActionQueue');

describe('Animator', function() {
  var animator;
  var actionQueue;
  beforeEach(function() {
    actionQueue = new MockActionQueue();
    animator = new Animator({ actionQueue: actionQueue });
  });

  describe('alternate', function() {
    it('does nothing until play() is called', function() {
      var f1 = createSpy();

      var animation = animator
        .alternate(f1)
        .every(100);

      expect(f1).toNotHaveBeenCalled();

      animation.play();

      expect(f1).toHaveBeenCalled();
    });

    it('alternates between the functions within the specified interval', function() {
      var f1 = createSpy();
      var f2 = createSpy();
      var f3 = createSpy();

      animator
        .alternate(f1, f2, f3)
        .every(100)
        .play();

      expect(f1).toHaveBeenCalled();
      expect(f2).toNotHaveBeenCalled();
      expect(f3).toNotHaveBeenCalled();

      f1.reset();
      actionQueue.step(50);

      expect(f1).toNotHaveBeenCalled();
      expect(f2).toNotHaveBeenCalled();
      expect(f3).toNotHaveBeenCalled();

      actionQueue.step(50);

      expect(f1).toNotHaveBeenCalled();
      expect(f2).toHaveBeenCalled();
      expect(f3).toNotHaveBeenCalled();

      f2.reset();
      actionQueue.step(100);

      expect(f1).toNotHaveBeenCalled();
      expect(f2).toNotHaveBeenCalled();
      expect(f3).toHaveBeenCalled();

      f3.reset();
      actionQueue.step(100);

      expect(f1).toHaveBeenCalled();
      expect(f2).toNotHaveBeenCalled();
      expect(f3).toNotHaveBeenCalled();
    });

    it('stops when the predicate returns false', function() {
      var f1 = createSpy();
      var predicate = createSpy().andReturn(true);

      animator.alternate(f1).every(100).asLongAs(predicate).play();

      expect(f1).toHaveBeenCalled();

      f1.reset();
      actionQueue.step(100);

      expect(f1).toHaveBeenCalled();

      f1.reset();
      predicate.andReturn(false);
      actionQueue.step(100);

      expect(f1).toNotHaveBeenCalled();

      actionQueue.step(100);
      expect(f1).toNotHaveBeenCalled();
    });

    it('stops when told to', function() {
      var f1 = createSpy();

      var animation = animator.alternate(f1).every(100).play();

      expect(f1).toHaveBeenCalled();

      f1.reset();
      actionQueue.step(100);

      expect(f1).toHaveBeenCalled();

      f1.reset();
      animation.stop();
      actionQueue.step(100);

      expect(f1).toNotHaveBeenCalled();

      actionQueue.step(100);
      expect(f1).toNotHaveBeenCalled();
    });

    it('does nothing if the predicate is false immediately', function() {
      var f1 = createSpy();
      var predicate = createSpy().andReturn(false);

      animator.alternate(f1).every(100).asLongAs(predicate).play();

      expect(f1).toNotHaveBeenCalled();
      actionQueue.step(100);
      expect(f1).toNotHaveBeenCalled();
    });
  });
});
