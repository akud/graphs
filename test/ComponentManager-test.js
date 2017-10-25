var ComponentManager = require('../src/ComponentManager');
var MockActionQueue = require('./utils/MockActionQueue');

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
    this.onClose = createSpy();
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
        'getStyle.returnValue': 'foobar',
      });

      componentManager.insertComponent({
        class: ComponentClass,
        position: position,
      });
      expect(element.style).toEqual('foobar');
    });

    it('pins the element to the result of the supplied function', function() {
      var n = 0;
      var p1 = createSpyObjectWith({'getStyle.returnValue': 'position1'});
      var p2 = createSpyObjectWith({'getStyle.returnValue': 'position2'});
      var p3 = createSpyObjectWith({'getStyle.returnValue': 'position3'});
      var pinTo = createSpy().andCall(function() {
        return [p1, p2, p3][(n++)%3];
      });

      componentManager.insertComponent({
        class: ComponentClass,
        pinTo: pinTo,
      });

      actionQueue.step(actionQueue.mainQueueInterval);
      expect(element.style).toEqual('position1');
      expect(p1.getStyle).toHaveBeenCalledWith({
        width: element.offsetWidth,
        height: element.offsetHeight,
      });

      actionQueue.step(actionQueue.mainQueueInterval);
      expect(element.style).toEqual('position2');
      expect(p2.getStyle).toHaveBeenCalledWith({
        width: element.offsetWidth,
        height: element.offsetHeight,
      });

      actionQueue.step(actionQueue.mainQueueInterval);
      expect(element.style).toEqual('position3');
      expect(p3.getStyle).toHaveBeenCalledWith({
        width: element.offsetWidth,
        height: element.offsetHeight,
      });

      expect(pinTo.calls.length).toBe(3);
    });

    it('cancels the position tracking when the component is closed', function() {
      var pinTo = createSpy().andReturn(
        createSpyObjectWith({ 'getStyle.returnValue': 'p1' })
      );

      var component = componentManager.insertComponent({
        class: ComponentClass,
        pinTo: pinTo,
      });

      expect(component.onClose).toHaveBeenCalled();

      actionQueue.step(actionQueue.mainQueueInterval);
      expect(element.style).toEqual('p1');

      component.onClose.calls[0].arguments[0]();

      actionQueue.step(actionQueue.mainQueueInterval);

      expect(pinTo.calls.length).toBe(1);
    });
  });
});
