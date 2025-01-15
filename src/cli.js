import exit from 'exit';
import getopts from 'getopts-compat';
import disDat from './index.mjs';

const figures = {
  tick: '✔',
  cross: '✘',
};

export default (argv, name) => {
  const options = getopts(argv, {
    alias: { silent: 's', concurrency: 'c' },
    boolean: ['silent'],
    default: { concurrency: name === 'dtd' ? 1 : Infinity },
    stopEarly: true,
  });

  const args = options._;
  if (!args.length) {
    console.log(`Missing command. Example usage: ${name} [command]`);
    return exit(2);
  }

  options.stdio = 'inherit';
  disDat(args, options, (err, results) => {
    if (err && err.message.indexOf('ExperimentalWarning') >= 0) err = null;
    if (err) {
      results = err.results;
      console.log(err.message);
    }
    const errors = results.filter((result) => !!result.error);

    if (!options.silent) {
      console.log('\n======================');
      results.forEach((res) => console.log(`${res.error ? figures.cross : figures.tick} ${[res.command].concat(res.args).join(' ')}${res.error ? ` Error: ${res.error.message}` : ''}`));
      console.log('\n----------------------');
      console.log(`${name} ${args.map(x => x.indexOf(' ') >= 0 ? `"${x}"` : x).join(' ')}\n${errors.length ? `${errors.length} failed` : `${results.length - errors.length} succeeded`}`);
    }
    exit(err || errors.length ? 3 : 0);
  });
};
