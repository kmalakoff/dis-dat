const Queue = require('queue-cb');
const parse = require('string-argv').parseArgsStringToArgv;
const spawn = require('cross-spawn-cb');
const spawnStreaming = require('spawn-streaming');

const bracketsRegEx = /\{([\s\S]*)\}/;

module.exports = function run(commands, options, callback) {
  const spawnOptions = { cwd: process.cwd(), ...options };
  let results = [];
  const queue = new Queue(options.concurrency || Infinity);

  commands.forEach((_command, index) => {
    queue.defer((cb) => {
      const command = commands[index];
      const match = commands[index].match(bracketsRegEx);
      const argv = match ? parse(match[1]) : parse(command);
      const args = argv.slice(1);

      const process = (err, result) => {
        if (err && err.message.indexOf('ExperimentalWarning') >= 0) {
          res = err;
          err = null;
        }

        // suppress error
        if (err && match) {
          result = err;
          err = null;
        }

        results.push({ index, command: argv[0], args, error: err, result });
        if (err && options.concurrency === 1) return cb(err); // break early
        cb();
      };

      if (commands.length < 2) spawn(argv[0], args, spawnOptions, process);
      else spawnStreaming(argv[0], args, spawnOptions, { prefix: command }, process);
    });
  });

  queue.await((err) => {
    results = results.sort((a, b) => a.index - b.index);
    if (err) err.results = results;
    err ? callback(err) : callback(null, results);
  });
};
