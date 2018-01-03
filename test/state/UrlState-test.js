var UrlState = require('../../src/state/UrlState');
var MockUrlSearchParams = require('../test_utils/MockUrlSearchParams');

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

    it('persists a new node\'s label if it is provided', function() {
      urlSearchParams.setNumericParam('n', 7);
      state.persistNode({ label: 'hello' });
      expect(urlSearchParams.set).toHaveBeenCalledWith('l_7', 'hello');
    });

    it('encodes a new node\'s label before setting on the params', function() {
      urlSearchParams.setNumericParam('n', 2);
      state.persistNode({ label: 'hello world:' });
      expect(urlSearchParams.set).toHaveBeenCalledWith('l_2', 'hello%20world%3A');
    });

    it('updates a node label', function() {
      urlSearchParams.setNumericParam('n', 3);
      state.persistNode({ id: 1, label: 'hello world:' });
      expect(urlSearchParams.set).toHaveBeenCalledWith('l_1', 'hello%20world%3A');
    });

    it('removes a node label if it is set to null', function() {
      urlSearchParams.setNumericParam('n', 3);
      state.persistNode({ id: 1, label: null });
      expect(urlSearchParams.delete).toHaveBeenCalledWith('l_1');
    });

    it('persists a new node\'s link if it is provided', function() {
      urlSearchParams.setNumericParam('n', 7);
      state.persistNode({ link: '/foobar' });
      expect(urlSearchParams.set).toHaveBeenCalledWith('li_7', '%2Ffoobar');
    });

    it('updates a node link', function() {
      urlSearchParams.setNumericParam('n', 3);
      state.persistNode({ id: 1, link: '/foo/bar' });
      expect(urlSearchParams.set).toHaveBeenCalledWith('li_1', '%2Ffoo%2Fbar');
    });

    it('deletes a node link if it is set to null', function() {
      urlSearchParams.setNumericParam('n', 3);
      state.persistNode({ id: 1, link: null });
      expect(urlSearchParams.delete).toHaveBeenCalledWith('li_1');
    });

    it('does not change a node\'s other properties if only a label is provided', function() {
      urlSearchParams.setNumericParam('n', 5);
      urlSearchParams.setHexEncodedBinary('c_FFFFFF', '1010');
      urlSearchParams.set('li_1', '%2Fwtf');
      state.persistNode({ id: 1, label: 'hello' });
      expect(urlSearchParams.get('c_FFFFFF')).toEqual(matchers.hexEncodedBinary('1010'));
      expect(urlSearchParams.get('li_1')).toEqual('%2Fwtf');
    });

    it('does not change a node\'s other properties if only a color is provided', function() {
      urlSearchParams.setNumericParam('n', 5);
      urlSearchParams.set('l_1', 'hello');
      urlSearchParams.setHexEncodedBinary('c_FFFFFF', '1000');
      urlSearchParams.set('li_1', '%2Fwtf');
      state.persistNode({ id: 1, color: '#FFFFFF' });
      expect(urlSearchParams.get('l_1')).toEqual('hello');
      expect(urlSearchParams.set).toHaveBeenCalledWith('c_FFFFFF', matchers.hexEncodedBinary('1010'));
      expect(urlSearchParams.get('li_1')).toEqual('%2Fwtf');
    });

    it('does not change a node\'s other properties if only a link is provided', function() {
      urlSearchParams.setNumericParam('n', 5);
      urlSearchParams.set('l_1', 'hello');
      urlSearchParams.setHexEncodedBinary('c_FFFFFF', '1000');
      urlSearchParams.set('li_1', '%2Fwtf');
      state.persistNode({ id: 1, link: '/foobar' });
      expect(urlSearchParams.get('l_1')).toEqual('hello');
      expect(urlSearchParams.get('c_FFFFFF')).toEqual(matchers.hexEncodedBinary('1000'));
      expect(urlSearchParams.set).toHaveBeenCalledWith('li_1', '%2Ffoobar');
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

    it('removes existing color from the node if deleting color', function() {
      urlSearchParams.setHexEncodedBinary('c_FFFFFF', '1010');
      state.persistNode({ id: 3, color: null });
      expect(urlSearchParams.set).toHaveBeenCalledWith('c_FFFFFF', matchers.hexEncodedBinary('0010'));
      expect(urlSearchParams.set.calls.length).toBe(1);
    });

    it('removes the existing color param if node was only one with color', function() {
      urlSearchParams.setHexEncodedBinary('c_FFFFFF', '10');
      state.persistNode({ id: 1, color: '#00FF00' });
      expect(urlSearchParams.delete).toHaveBeenCalledWith('c_FFFFFF');
      expect(urlSearchParams.set).toHaveBeenCalledWith('c_00FF00', matchers.hexEncodedBinary('10'));
    });

    it('removes the existing color param if node was only one with color when deleting color', function() {
      urlSearchParams.setHexEncodedBinary('c_FFFFFF', '10');
      state.persistNode({ id: 1, color: null });
      expect(urlSearchParams.delete).toHaveBeenCalledWith('c_FFFFFF');
      expect(urlSearchParams.set).toNotHaveBeenCalled();
    });

    it('can set the label on node 0', function() {
      urlSearchParams.setNumericParam('n', 5);
      state.persistNode({ id: 0, label: 'hello' });
      expect(urlSearchParams.set).toHaveBeenCalledWith('l_0', 'hello');
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

  describe('retrieve node', function() {
    it('returns just the node id if there is no other data', function() {
      expect(state.retrieveNode(3)).toEqual({ id: 3 });
    });

    it('returns the node\'s stored data', function() {
      urlSearchParams.setHexEncodedBinary('c_0000FF', '101001');
      urlSearchParams.set('l_3', 'hello%20world');
      urlSearchParams.set('li_3', '%2Ffoo%2Fbar');
      expect(state.retrieveNode(3)).toEqual({
        id: 3,
        color: '#0000FF',
        label: 'hello world',
        link: '/foo/bar',
      });
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

    it('returns node labels if present', function() {
      urlSearchParams.setNumericParam('n', 3);
      urlSearchParams.set('l_0', 'hello');
      urlSearchParams.set('l_2', encodeURIComponent('what\'s up doc'));
      expect(state.retrievePersistedNodes()).toEqual([
        { id: 0, label: 'hello' },
        { id: 1 },
        { id: 2, label: 'what\'s up doc' },
      ]);
    });

    it('returns node links if present', function() {
      urlSearchParams.setNumericParam('n', 3);
      urlSearchParams.set('li_0', '%2Ffoo');
      urlSearchParams.set('li_2', '%2Fbar');
      expect(state.retrievePersistedNodes()).toEqual([
        { id: 0, link: '/foo' },
        { id: 1 },
        { id: 2, link: '/bar' },
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
