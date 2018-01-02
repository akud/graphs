var Link = require('../../src/components/Link');

describe('Link', function() {
  it('displays an a tag', function() {
    var component = new Link({ text: 'hello', link: '/foo' });
    expect(component.getGeneratedMarkup()).toEqual('<a href="/foo">hello</a>');
  });
});
