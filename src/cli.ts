import exit from 'exit';
import getopts from 'getopts-compat';
import spawnTerm, { figures, formatArguments } from 'spawn-term';
import run from './index.js';

const ERROR_CODE = 3;

export default (argv, name) => {
  const options = getopts(argv, {
    alias: { silent: 'si', concurrency: 'c', expanded: 'e', streaming: 's' },
    boolean: ['silent', 'expanded', 'streaming'],
    default: { concurrency: name === 'dtd' ? 1 : Infinity },
    stopEarly: true,
  });

  const args = options._;
  if (!args.length) {
    console.log(`Missing command. Example usage: ${name} "[command1]" "[command2]" "[command3]"...`);
    return exit(ERROR_CODE);
  }

  options.stdio = 'inherit'; // pass through stdio
  return run(args, options, (err, results) => {
    if (err && !err.results) {
      console.log(err.message);
      return exit(ERROR_CODE);
    }
    if (err) results = err.results;
    const errors = results.filter((result) => !!result.error);

    if (!options.silent) {
      if (!spawnTerm) {
        console.log('\n======================');
        results.forEach((res) => console.log(`${res.error ? figures.cross : figures.tick} ${formatArguments([res.command].concat(res.args))}${res.error ? ` Error: ${res.error.message}` : ''}`));
      }
      console.log('\n----------------------');
      console.log(`${name} ${formatArguments(args).join(' ')}`);
      console.log(`${figures.tick} ${results.length - errors.length} succeeded`);
      if (errors.length) console.log(`${figures.cross} ${errors.length} failed`);
    }
    exit(err || errors.length ? ERROR_CODE : 0);
  });
};
