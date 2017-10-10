var UrlState = require('../src/UrlState');
var MockUrlSearchParams = require('./utils/MockUrlSearchParams');

describe('UrlState', function() {
  var setUrl;
  var baseUrl;
  var urlSearchParams;
  var state;

  beforeEach(function() {
    setUrl = createSpy();
    baseUrl = 'https://example.com/hello';
    urlSearchParams = new MockUrlSearchParams();
    state = new UrlState({
      baseUrl: baseUrl,
      setUrl: setUrl,
      urlSearchParams: urlSearchParams,
    });
  });


  describe('persistNode', function() {

    afterEach(expectStateToHaveBeenPushed);

    it('sets the number of nodes to 1 if there are no nodes', function() {
      urlSearchParams.has.andReturn(false);
      var id = state.persistNode();
      expect(id).toBe(0);
      expect(urlSearchParams.set).toHaveBeenCalledWith('n', 1);
    });

    it('increments number of nodes', function() {
      urlSearchParams.setNumericParam('n', 4);
      var id = state.persistNode();
      expect(id).toBe(4);
      expect(urlSearchParams.set).toHaveBeenCalledWith('n', 5);
    });

    it('persists a new node\'s color if it is provided', function() {
      urlSearchParams.setNumericParam('n', 7);
      state.persistNode({ color: '#FFFFFF' });
      expect(urlSearchParams.set).toHaveBeenCalledWith('c_FFFFFF', matchers.hexEncodedBinary('10000000'));
    });

    it('persists a new node\'s color to existing color bitmask', function() {
      urlSearchParams.setNumericParam('n', 5);
      urlSearchParams.setHexEncodedBinary('c_FFFFFF', '1010');
      state.persistNode({ color: '#FFFFFF' });
      expect(urlSearchParams.set).toHaveBeenCalledWith('c_FFFFFF', matchers.hexEncodedBinary('101010'));
    });

    it('removes existing color from the node if changing colors', function() {
      urlSearchParams.setHexEncodedBinary('c_FFFFFF', '1010');
      state.persistNode({ id: 3, color: '#00FF00' });
      expect(urlSearchParams.set).toHaveBeenCalledWith('c_FFFFFF', matchers.hexEncodedBinary('0010'));
      expect(urlSearchParams.set).toHaveBeenCalledWith('c_00FF00', matchers.hexEncodedBinary('1000'));
    });

    it('removes the existing color param if node was only one with color', function() {
      urlSearchParams.setHexEncodedBinary('c_FFFFFF', '10');
      state.persistNode({ id: 1, color: '#00FF00' });
      expect(urlSearchParams.delete).toHaveBeenCalledWith('c_FFFFFF');
      expect(urlSearchParams.set).toHaveBeenCalledWith('c_00FF00', matchers.hexEncodedBinary('10'));
    });
  });

  describe('persistEdge', function() {

    afterEach(expectStateToHaveBeenPushed);

    it('adds a param if there are no existing connections', function() {
      state.persistEdge(3, 5);
      expect(urlSearchParams.set).toHaveBeenCalledWith('e_3', matchers.hexEncodedBinary('100000'));
    });

    it('updates existing edge param', function() {
      urlSearchParams.setHexEncodedBinary('e_7', '10010');
      state.persistEdge(7, 2);
      expect(urlSearchParams.set).toHaveBeenCalledWith('e_7', matchers.hexEncodedBinary('10110'));
    });
  });

  describe('retrieve persisted nodes', function() {
    it('returns empty array if there is no node param', function() {
      expect(state.retrievePersistedNodes()).toEqual([]);
    });

    it('returns nodes with ids', function() {
      urlSearchParams.setNumericParam('n', 6);
      expect(state.retrievePersistedNodes()).toEqual([
        { id: 0 },
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
      ]);
    });

    it('returns nodes with colors if present', function() {
      urlSearchParams.setNumericParam('n', 6);
      urlSearchParams.setHexEncodedBinary('c_0000FF', '100001');
      urlSearchParams.setHexEncodedBinary('c_00FF00', '000100');
      urlSearchParams.setHexEncodedBinary('c_FF0000', '011000');
      expect(state.retrievePersistedNodes()).toEqual([
        { id: 0, color: '#0000FF' },
        { id: 1 },
        { id: 2, color: '#00FF00' },
        { id: 3, color: '#FF0000' },
        { id: 4, color: '#FF0000' },
        { id: 5, color: '#0000FF' },
      ]);
    });
  });

  describe('retrievePersistedEdges', function() {
    it('returns an empty array if there are no edge params', function() {
      expect(state.retrievePersistedEdges()).toEqual([]);
    });

    it('returns a flat array of edges from params', function() {
      urlSearchParams.setNumericParam('n', 10);
      urlSearchParams.setHexEncodedBinary('e_2', '00001000011');
      urlSearchParams.setHexEncodedBinary('e_5', '00100010100');
      urlSearchParams.setHexEncodedBinary('e_7', '11000100000');
      expect(state.retrievePersistedEdges()).toEqual([
        { source: 2, target: 0 },
        { source: 2, target: 1 },
        { source: 2, target: 6 },
        { source: 5, target: 2 },
        { source: 5, target: 4 },
        { source: 5, target: 8 },
        { source: 7, target: 5 },
        { source: 7, target: 9 },
        { source: 7, target: 10 },
      ]);
    });
  });

  describe('reset', function() {
    afterEach(expectStateToHaveBeenPushed);

    it('deletes each key in the urlsearchparams', function() {
      urlSearchParams.set('foo', 'BAR');
      urlSearchParams.set('baz', 'bul');
      state.reset();
      expect(urlSearchParams.delete).toHaveBeenCalledWith('foo');
      expect(urlSearchParams.delete).toHaveBeenCalledWith('baz');
    });
  });

  function expectStateToHaveBeenPushed() {
    expect(setUrl).toHaveBeenCalledWith(baseUrl + '?' + urlSearchParams.toString());
  }
});
