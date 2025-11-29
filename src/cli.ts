import exit from 'exit';
import getopts from 'getopts-compat';
import run from './index.ts';
import loadSpawnTerm from './lib/loadSpawnTerm.ts';

const ERROR_CODE = 3;

import type { DisDatError, DisDatOptions, DisDatResult } from './types.ts';

export default (argv: string[], name: string): undefined => {
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
  run(args, options as DisDatOptions, (err?: DisDatError, results?: DisDatResult[]): undefined => {
    if (err && !err.results) {
      console.log(err.message);
      return exit(ERROR_CODE);
    }
    if (err) results = err.results;
    const errors = results.filter((result) => !!result.error);

    if (!options.silent) {
      // Load spawn-term to get figures/formatArguments for output formatting
      loadSpawnTerm((_loadErr, { spawnTerm, figures, formatArguments }) => {
        if (!spawnTerm) {
          console.log('\n======================');
          results.forEach((res) => {
            console.log(`${res.error ? figures.cross : figures.tick} ${formatArguments([res.command].concat(res.args))}${res.error ? ` Error: ${res.error.message}` : ''}`);
          });
          console.log('\n----------------------');
          console.log(`${name} ${formatArguments(args).join(' ')}`);
          console.log(`${figures.tick} ${results.length - errors.length} succeeded`);
          if (errors.length) console.log(`${figures.cross} ${errors.length} failed`);
        }
        exit(err || errors.length ? ERROR_CODE : 0);
      });
    } else {
      exit(err || errors.length ? ERROR_CODE : 0);
    }
  });
};
