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
    return exit(-1);
  }

  if (!options.silent)
    options.header = (command) => {
      console.log('\n----------------------');
      console.log(command);
      console.log('----------------------');
    };

  options.stdio = 'inherit';
  disDat(args, options, (err, results) => {
    if (err) {
      console.log(err.message);
      return exit(err.code || -1);
    }
    const errors = results.filter((result) => !!result.error);

    if (!options.silent) {
      console.log('\n======================');
      console.log(`${name} "${args.join('" "')}" ${errors.length ? 'failed' : 'succeeded'}`);
      results.forEach((res) => console.log(`${res.error ? figures.cross : figures.tick} ${[res.command].concat(res.args).join(' ')}${res.error ? ` Error: ${res.error.message}` : ''}`));
    }

    exit(errors.length ? -1 : 0);
  });
};
