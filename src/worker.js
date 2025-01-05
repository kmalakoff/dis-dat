const Queue = require('queue-cb');
const parse = require('string-argv').parseArgsStringToArgv;
const spawn = require('cross-spawn-cb');

const bracketsRegEx = /\{([\s\S]*)\}/;

module.exports = function run(commands, options, callback) {
  const spawnOptions = { cwd: process.cwd(), ...options };
  let results = [];
  const queue = new Queue(options.concurrency || Infinity);

  for (let index = 0; index < commands.length; index++) {
    ((index) => {
      queue.defer((cb) => {
        const command = commands[index];
        const match = commands[index].match(bracketsRegEx);
        const argv = match ? parse(match[1]) : parse(command);
        const args = argv.slice(1);

        !options.header || options.header(command);
        spawn(argv[0], args, spawnOptions, (err, result) => {
          // suppress error
          if (err && match) {
            result = err;
            err = null;
          }

          results.push({ index, command: argv[0], args, error: err, result });
          if (err && options.concurrency === 1) return cb(err); // break early
          cb();
        });
      });
    })(index);
  }

  queue.await(() => {
    results = results.sort((a, b) => a.index - b.index);
    callback(null, results);
  });
};
