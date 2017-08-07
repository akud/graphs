function Logger() {

}

Logger.prototype = {
  debug: function(msg, objs) {
    this._log.apply(this, ['DEBUG'].concat(Array.prototype.splice.call(arguments, 0)));
  },
  warn: function(msg, objs) {
    this._log.apply(this, ['WARN'].concat(Array.prototype.splice.call(arguments, 0)));
  },
  error: function(msg, objs) {
    this._log.apply(this, ['ERROR'].concat(Array.prototype.splice.call(arguments, 0)));
  },

  _log: function() {
    global.console.log.apply(global.console.log, arguments);
  },
};


module.exports = new Logger();
