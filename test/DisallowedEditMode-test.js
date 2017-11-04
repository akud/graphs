var DisallowedEditMode = require('../src/DisallowedEditMode');
var graphelements = require('../src/graphelements');
var colors = require('../src/colors');

describe('DisallowedEditMode', function() {
  var editMode;

  beforeEach(function() {
    editMode = new DisallowedEditMode();
  });

  describe('activate', function() {
    it('does nothing', function() {
      editMode.activate(new graphelements.Node({ id: 0 }));
    });
  });

  describe('deactivate', function() {
    it('does nothing', function() {
      editMode.activate(new graphelements.Node({ id: 0 }));
      editMode.deactivate();
    });
  });

  describe('perform', function() {
    it('always performs the ifNotActiveAction', function() {
      var ifActive = createSpy();
      var ifNotActive = createSpy();

      editMode.activate(new graphelements.Node({ id: 0 }));

      editMode.perform({ ifActive: ifActive, ifNotActive: ifNotActive });
      expect(ifActive).toNotHaveBeenCalled();
      expect(ifNotActive).toHaveBeenCalled();
    });
  });
});
