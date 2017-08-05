var Component = require('../src/Component');
var MockActionQueue = require('./utils/MockActionQueue');


describe('Component', function() {

  var component;
  var actionQueue;
  var element;

  beforeEach(function() {
    actionQueue = new MockActionQueue();
    component = new Component(
      { actionQueue: actionQueue },
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
      actionQueue.step(50);
      expect(component.handleClickAndHold).toNotHaveBeenCalled();
    });

    it('triggers after the component\'s hold time', function() {
      element.trigger('mousedown');
      expect(component.handleClickAndHold).toNotHaveBeenCalled();
      actionQueue.step(100);
      expect(component.handleClickAndHold).toHaveBeenCalled();
    });

    it('passes the mousedown event', function() {
      var mouseDownEvent = createSpy();
      element.clickAndHold(actionQueue, 100, mouseDownEvent);
      expect(component.handleClickAndHold).toHaveBeenCalledWith(mouseDownEvent);
    });


    it('does not trigger if mouse has been lifted up in time', function() {
      element.trigger('mousedown');
      actionQueue.step(50);
      element.trigger('mouseup');
      actionQueue.step(50);
      expect(component.handleClickAndHold).toNotHaveBeenCalled();
    });

    it('does not trigger if mouse has been lifted up and put down', function() {
      element.trigger('mousedown');
      actionQueue.step(50);
      element.trigger('mouseup');
      element.trigger('mousedown');
      actionQueue.step(50);
      expect(component.handleClickAndHold).toNotHaveBeenCalled();
    });

    it('only triggers once if mouse comes up and back down again', function() {
      element.clickAndHold(actionQueue, 50);
      element.clickAndHold(actionQueue, 100);
      expect(component.handleClickAndHold).toHaveBeenCalled();
      expect(component.handleClickAndHold.calls.length).toBe(1);
    });

    it('does not call the click handler', function() {
      spyOn(component, 'handleClick');
      element.clickAndHold(actionQueue, 100);
      expect(component.handleClick).toNotHaveBeenCalled();
    });
  });
});
