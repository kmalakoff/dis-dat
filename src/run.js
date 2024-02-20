const Queue = require('queue-cb');
const parse = require('string-argv').parseArgsStringToArgv;
const spawn = require('cross-spawn-cb');

module.exports = function run(commands, options, callback) {
  const spawnOptions = { cwd: process.cwd(), ...options };
  let results = [];
  const queue = new Queue(options.concurrency || Infinity);

  for (let index = 0; index < commands.length; index++) {
    ((index) => {
      queue.defer((callback) => {
        const command = commands[index];
        const argv = parse(command);
        !options.header || options.header(command);
        spawn(argv[0], argv.slice(1), spawnOptions, (err, res) => {
          results.push({ index: index, command: command, error: err, result: res });
          callback();
        });
      });
    })(index);
  }

  queue.await((err) => {
    if (err) return callback(err);
    results = results.sort((a, b) => a.index - b.index);
    callback(null, results);
  });
};
