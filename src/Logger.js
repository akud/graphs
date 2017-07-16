function Logger() {

}

Logger.prototype = {
  debug: function(msg, objs) {
    this._log.apply(this, ['DEBUG'] + arguments);
  },
  warn: function(msg, objs) {
    this._log.apply(this, ['WARN'] + arguments);
  },
  error: function(msg, objs) {
    this._log.apply(this, ['ERROR'] + arguments);
  },

  _log: function(level, msg) {
    var objs = Array.prototype.splice.call(arguments, 1, arguments.length);
    global.console.log('[' + level + '] ' + msg);
    Array.prototype.forEach.call(objs, function(obj) { console.log(obj); });
  },
};


module.exports = Logger;
