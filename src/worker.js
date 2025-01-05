const Queue = require('queue-cb');
const parse = require('string-argv').parseArgsStringToArgv;
const spawn = require('cross-spawn-cb');

const bracketsRegEx = /\{([\s\S]*)\}/;

// https://github.com/yarnpkg/berry/blob/2cf0a8fe3e4d4bd7d4d344245d24a85a45d4c5c9/packages/yarnpkg-pnp/sources/loader/applyPatch.ts#L414-L435
const originalEmit = process.emit;
// @ts-expect-error - TS complains about the return type of originalEmit.apply
process.emit = (name, data, ..._args) => {
  if (name === 'warning' && typeof data === 'object' && data.name === 'ExperimentalWarning' && (data.message.includes('--experimental-loader') || data.message.includes('Custom ESM Loaders is an experimental feature'))) return false;

  return originalEmit.call(process, name, data, ..._args);
};

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
        });
      });
    })(index);
  }

  queue.await(() => {
    results = results.sort((a, b) => a.index - b.index);
    callback(null, results);
  });
};
