var Component = require('../src/Component');
var MockTimer = require('./utils/MockTimer');


describe('Component', function() {

  var component;
  var timer;
  var element;

  beforeEach(function() {
    timer = new MockTimer();
    component = new Component(
      { setTimeout: timer.getSetTimeoutFn() },
      { holdTime: 100 }
    );
    element = new MockDomNode();
  });

  describe('attachTo', function() {
    it('delegates to component\'s doAttach method', function() {
      spyOn(component, 'doAttach');
      component.attachTo(element);
      expect(component.doAttach).toHaveBeenCalledWith(element);
    });

    it('sets up event listeners', function() {
      component.attachTo(element);
      expect(element.addEventListener).toHaveBeenCalledWith('click', matchers.any(Function));
      expect(element.addEventListener).toHaveBeenCalledWith('mousedown', matchers.any(Function));
      expect(element.addEventListener).toHaveBeenCalledWith('mouseup', matchers.any(Function));
    });
  });

  describe('click event', function() {
    beforeEach(function() {
      component.attachTo(element);
      spyOn(component, 'handleClick');
    });

    it('calls the component\'s handleClick method', function() {
      var event = createSpy();
      element.click(event);
      expect(component.handleClick).toHaveBeenCalledWith(event);
    });
  });

  describe('click and hold event', function() {
    beforeEach(function() {
      component.attachTo(element);
      spyOn(component, 'handleClickAndHold');
    });

    it('does not trigger on click', function() {
      var event = createSpy();
      element.click(event);
      expect(component.handleClickAndHold).toNotHaveBeenCalled();
    });

    it('does not trigger if not enough time has passed', function() {
      element.trigger('mousedown');
      expect(component.handleClickAndHold).toNotHaveBeenCalled();
      timer.step(50);
      expect(component.handleClickAndHold).toNotHaveBeenCalled();
    });

    it('triggers after the component\'s hold time', function() {
      element.trigger('mousedown');
      expect(component.handleClickAndHold).toNotHaveBeenCalled();
      timer.step(100);
      expect(component.handleClickAndHold).toHaveBeenCalled();
    });

    it('passes the mousedown event', function() {
      var mouseDownEvent = createSpy();
      element.trigger('mousedown', mouseDownEvent);
      timer.step(100);
      expect(component.handleClickAndHold).toHaveBeenCalledWith(mouseDownEvent);
    });


    it('does not trigger if mouse has been lifted up in time', function() {
      element.trigger('mousedown');
      timer.step(50);
      element.trigger('mouseup');
      timer.step(50);
      expect(component.handleClickAndHold).toNotHaveBeenCalled();
    });

    it('does not trigger if mouse has been lifted up and put down', function() {
      element.trigger('mousedown');
      timer.step(50);
      element.trigger('mouseup');
      element.trigger('mousedown');
      timer.step(50);
      expect(component.handleClickAndHold).toNotHaveBeenCalled();
    });

  });
});