import run from './run';

export default function disDat(commands, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  if (typeof callback === 'function') return run(commands, options, callback);
  return new Promise((resolve, reject) => {
    run(commands, options, function runCallback(err, result) {
      err ? reject(err) : resolve(result);
    });
  });
}
