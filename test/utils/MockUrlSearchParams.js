function MockUrlSearchParams() {
  this.params = {};

  this.has = createSpy().andCall((function(key) {
    return this.params.hasOwnProperty(key);
  }).bind(this));

  this.get = createSpy().andCall((function(key) {
    return this.params[key];
  }).bind(this));

  this.set = createSpy().andCall((function(key, value) {
    this.params[key] = value;
  }).bind(this));

  this.toString = createSpy().andCall((function() {
    return Object.keys(this.params)
      .map((function(k) { return k + '=' + this.params[k]; }).bind(this))
      .reduce(function(a, b) { return a + '&' + 'b'; }, 'toString:');
  }).bind(this));

  this.delete = createSpy().andCall((function(key) {
    delete this.params[key];
  }).bind(this));

  this.keys = createSpy().andCall((function() {
    return Object.keys(this.params);
  }).bind(this));
}

MockUrlSearchParams.prototype = {
  setNumericParam: function(key, n) {
    if (n) {
      this.params[key] = n.toString();
    } else {
      delete this.params[key];
    }
  },

  setHexEncodedBinary: function(key, binaryString) {
    this.params[key] = parseInt(binaryString, 2).toString(16);
  },
};

module.exports = MockUrlSearchParams;
