var BlockText = require('../src/BlockText');

describe('BlockText', function() {
  it('displays a p tag', function() {
    var component = new BlockText({ text: 'hello' });
    expect(component.getGeneratedMarkup()).toEqual('<p>hello</p>');
  });
});
