var ComponentManager = require('../src/ComponentManager');
var MockActionQueue = require('./test_utils/MockActionQueue');

describe('ComponentManager', function() {
  var componentManager;
  var actionQueue;
  var document;
  var body;
  var element;
  var componentServices;
  function ComponentClass(opts) {
    this.constructorArgs = opts;
    this.attachTo = createSpy();
    this.onRemove = createSpy();
  }

  beforeEach(function() {
    body = createSpyObjectWith('insertBefore', 'firstChild');
    element = new MockDomNode({
      'offsetWidth': 123,
      'offsetHeight': 456,
    });
    document = createSpyObjectWith({
      'createElement.returnValue': element,
      body: body,
    });
    actionQueue = new MockActionQueue();
    componentServices = { a: 'b', c: 'd' };

    componentManager = new ComponentManager({
      document: document,
      actionQueue: actionQueue,
      componentServices: componentServices,
    });
  });

  describe('insertComponent', function() {
    it('creates a new component and attaches the component', function() {
      var component = componentManager.insertComponent({
        class: ComponentClass,
        constructorArgs: { hello: 'world' },
      });
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(body.insertBefore).toHaveBeenCalledWith(element, body.firstChild);
      expect(component.attachTo).toHaveBeenCalledWith(element);
      expect(component.constructorArgs).toEqual({
        a: 'b',
        c: 'd',
        hello: 'world',
      });
      expect(componentServices).toEqual({
        a: 'b',
        c: 'd',
      });
    });

    it('sets the position on the element', function() {
      var position = createSpyObjectWith({
        'getElementPosition.returnValue': { top: 123, left: 456 },
      });

      componentManager.insertComponent({
        class: ComponentClass,
        position: position,
      });
      expect(element.style).toEqual({
        position: 'fixed',
        zIndex: '1',
        top: '123px',
        left: '456px',
      });
    });

    it('pins the element to the result of the supplied function', function() {
      var n = 0;
      var p1 = createSpyObjectWith({
        'getElementPosition.returnValue': {
          left: 1,
          top: 2,
        },
      });
      var p2 = createSpyObjectWith({
        'getElementPosition.returnValue': {
          left: 3,
          top: 4,
        },
      });
      var p3 = createSpyObjectWith({
        'getElementPosition.returnValue': {
          left: 5,
          top: 6,
        },
      });
      var pinTo = createSpy().andCall(function() {
        return [p1, p2, p3][(n++)%3];
      });

      componentManager.insertComponent({
        class: ComponentClass,
        pinTo: pinTo,
      });

      actionQueue.step(actionQueue.mainQueueInterval);
      expect(element.style).toEqual({
        position: 'fixed',
        zIndex: '1',
        left: '1px',
        top: '2px',
      });
      expect(p1.getElementPosition).toHaveBeenCalledWith({
        width: element.offsetWidth,
        height: element.offsetHeight,
      });

      actionQueue.step(actionQueue.mainQueueInterval);
      expect(element.style).toEqual({
        position: 'fixed',
        zIndex: '1',
        left: '3px',
        top: '4px',
      });
      expect(p2.getElementPosition).toHaveBeenCalledWith({
        width: element.offsetWidth,
        height: element.offsetHeight,
      });

      actionQueue.step(actionQueue.mainQueueInterval);
      expect(element.style).toEqual({ position: 'fixed', left: '5px', top: '6px' });
      expect(p3.getElementPosition).toHaveBeenCalledWith({
        width: element.offsetWidth,
        height: element.offsetHeight,
      });

      expect(pinTo.calls.length).toBe(3);
    });

    it('cancels the position tracking when the component is closed', function() {
      var pinTo = createSpy().andReturn(
        createSpyObjectWith({
          'getElementPosition.returnValue': {
            left: 56,
            top: 234,
          },
        })
      );

      var component = componentManager.insertComponent({
        class: ComponentClass,
        pinTo: pinTo,
      });

      expect(component.onRemove).toHaveBeenCalled();

      actionQueue.step(actionQueue.mainQueueInterval);
      expect(element.style).toEqual({
        position: 'fixed',
        zIndex: '1',
        left: '56px',
        top: '234px',
      });

      component.onRemove.calls[0].arguments[0]();

      actionQueue.step(actionQueue.mainQueueInterval);

      expect(pinTo.calls.length).toBe(1);
    });
  });
});
