var EmptyLabelSet = require('../../src/labels/EmptyLabelSet');

describe('EmptyLabelSet', function() {
  var labelSet;

  beforeEach(function() {
    labelSet = new EmptyLabelSet();
  });

  describe('initialize', function() {
    it('does nothing', function() {
      labelSet.initialize();
    });
  });

  describe('edit', function() {
    it('does nothing', function() {
      labelSet.edit();
    });
  });

  describe('display', function() {
    it('does nothing', function() {
      labelSet.display();
    });
  });

  describe('closeAll', function() {
    it('does nothing', function() {
      labelSet.closeAll();
    });
  });
});
