var LEVEL_ORDER = [
  'DEBUG',
  'INFO',
  'WARN',
  'ERROR',
];

function Logger(name) {
  this.name = name || 'Logger';
}

Logger.level = 'WARN';
Logger.levels = {};

Logger.prototype = {
  debug: function(msg, objs) {
    this._log.apply(this, [new Date().getTime(), 'DEBUG', this.name].concat(Array.prototype.splice.call(arguments, 0)));
  },
  info: function(msg, objs) {
    this._log.apply(this, [new Date().getTime(), 'INFO', this.name].concat(Array.prototype.splice.call(arguments, 0)));
  },
  warn: function(msg, objs) {
    this._log.apply(this, [new Date().getTime(), 'WARN', this.name].concat(Array.prototype.splice.call(arguments, 0)));
  },
  error: function(msg, objs) {
    this._log.apply(this, [new Date().getTime(), 'ERROR', this.name].concat(Array.prototype.splice.call(arguments, 0)));
  },

  _log: function() {
    var level = arguments[1];
    var logLevel = Logger.levels[this.name] || Logger.level;
    if (LEVEL_ORDER.indexOf(level) >= LEVEL_ORDER.indexOf(logLevel)) {
      global.console.log.apply(global.console.log, arguments);
    }
  },
};


module.exports = Logger;
