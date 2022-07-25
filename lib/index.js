require('./polyfills');
var run = require('./run');

module.exports = function disDat(commands, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  if (typeof callback === 'function') return run(commands, options, callback);
  return new Promise(function (resolve, reject) {
    run(commands, options, function runCallback(err, result) {
      err ? reject(err) : resolve(result);
    });
  });
};
