var TrackedObject = require('../src/TrackedObject');

describe('TrackedObject', function() {
  it('creates a unique id for each object', function() {
    var obj1 = new TrackedObject();
    var obj2 = new TrackedObject();
    expect(obj1.id).toBePresent();
    expect(obj2.id).toBePresent();

    expect(obj1.id).toNotEqual(obj2.id);
  });
});
