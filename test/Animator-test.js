var Animator = require('../src/Animator');
var MockTimer = require('./utils/MockTimer');

describe('Animator', function() {
  var animator;
  var timer;
  beforeEach(function() {
    timer = new MockTimer();
    animator = new Animator({ setTimeout: timer.getSetTimeoutFn() });
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
      timer.step(50);

      expect(f1).toNotHaveBeenCalled();
      expect(f2).toNotHaveBeenCalled();
      expect(f3).toNotHaveBeenCalled();

      timer.step(50);

      expect(f1).toNotHaveBeenCalled();
      expect(f2).toHaveBeenCalled();
      expect(f3).toNotHaveBeenCalled();

      f2.reset();
      timer.step(100);

      expect(f1).toNotHaveBeenCalled();
      expect(f2).toNotHaveBeenCalled();
      expect(f3).toHaveBeenCalled();

      f3.reset();
      timer.step(100);

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
      timer.step(100);

      expect(f1).toHaveBeenCalled();

      f1.reset();
      predicate.andReturn(false);
      timer.step(100);

      expect(f1).toNotHaveBeenCalled();

      timer.step(100);
      expect(f1).toNotHaveBeenCalled();
    });

    it('does nothing if the predicate is false immediately', function() {
      var f1 = createSpy();
      var predicate = createSpy().andReturn(false);

      animator.alternate(f1).every(100).asLongAs(predicate).play();

      expect(f1).toNotHaveBeenCalled();
      timer.step(100);
      expect(f1).toNotHaveBeenCalled();
    });
  });
});
