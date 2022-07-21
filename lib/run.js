var assign = require('just-extend');
var Queue = require('queue-cb');
var parse = require('string-argv').parseArgsStringToArgv;
var spawn = require('cross-spawn-cb');

module.exports = function run(commands, options, callback) {
  var spawnOptions = assign({ cwd: process.cwd() }, options);
  var results = [];
  var queue = new Queue(options.concurrency || Infinity);

  for (var index = 0; index < commands.length; index++) {
    (function (index) {
      queue.defer(function (callback) {
        var command = commands[index];
        var argv = parse(command);
        !options.header || options.header(command);
        spawn(argv[0], argv.slice(1), spawnOptions, function (err, res) {
          results.push({ index: index, command: command, error: err, result: res });
          callback();
        });
      });
    })(index);
  }

  queue.await(function (err) {
    if (err) return callback(err);
    results = results.sort(function (a, b) {
      return a.index - b.index;
    });
    callback(null, results);
  });
};
