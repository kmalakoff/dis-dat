const Queue = require('queue-cb');
const parse = require('string-argv').parseArgsStringToArgv;
const spawn = require('cross-spawn-cb');
const spawnStreaming = require('spawn-streaming');

const bracketsRegEx = /\{([\s\S]*)\}/;

module.exports = function run(commands, options, callback) {
  const spawnOptions = { cwd: process.cwd(), ...options };
  let results = [];
  const queue = new Queue(options.concurrency || Infinity);

  commands.forEach((_, index) => {
    queue.defer((cb) => {
      const match = commands[index].match(bracketsRegEx);
      const argv = match ? parse(match[1]) : parse(commands[index]);
      const command = argv[0];
      const args = argv.slice(1);

      const next = (err, res) => {
        if (err && err.message.indexOf('ExperimentalWarning') >= 0) {
          res = err;
          err = null;
        }

        // suppress error
        if (err && match) {
          res = err;
          err = null;
        }

        results.push({ index, command, args, error: err, result: res });
        if (err && options.concurrency === 1) return cb(err); // break early
        cb();
      };

      if (commands.length < 2) spawn(command, args, spawnOptions, next);
      else spawnStreaming(command, args, spawnOptions, { prefix: argv.map((x) => (x.indexOf(' ') >= 0 ? `"${x}"` : x)).join(' ') }, next);
    });
  });

  queue.await((err) => {
    results = results.sort((a, b) => a.index - b.index);
    if (err) err.results = results;
    err ? callback(err) : callback(null, results);
  });
};
