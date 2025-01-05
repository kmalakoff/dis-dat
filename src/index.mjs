import './filterExperimental.cjs';
import worker from './worker';

export default function disDat(commands, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  if (typeof callback === 'function') return worker(commands, options, callback);
  return new Promise((resolve, reject) => worker(commands, options, (err, result) => (err ? reject(err) : resolve(result))));
}
