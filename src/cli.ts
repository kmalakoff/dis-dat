import exit from 'exit';
import { readFileSync } from 'fs';
import getopts from 'getopts-compat';
import path from 'path';
import url from 'url';
import run from './index.ts';
import loadSpawnTerm from './lib/loadSpawnTerm.ts';

const ERROR_CODE = 3;
const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));

import type { DisDatError, DisDatOptions, DisDatResult } from './types.ts';

function getVersion(): string {
  const pkgPath = path.join(__dirname, '..', '..', 'package.json');
  return JSON.parse(readFileSync(pkgPath, 'utf8')).version;
}

function printHelp(name: string): void {
  const version = getVersion();
  console.log(`${name} v${version}`);
  console.log('');
  console.log(name === 'dad' ? 'Run commands in parallel (dis-and-dat)' : 'Run commands sequentially (dis-then-dat)');
  console.log('');
  console.log(`Usage: ${name} [options] "[command1]" "[command2]" "[command3]"...`);
  console.log('');
  console.log('Options:');
  console.log('  -v, --version      Show version number');
  console.log('  -h, --help         Show help');
  console.log('  -si, --silent      Suppress output summary');
  console.log('  -c, --concurrency  Number of concurrent commands (default: Infinity for dad, 1 for dtd)');
  console.log('  -e, --expanded     Show expanded command output');
  console.log('  -s, --streaming    Stream output in real-time');
  console.log('');
  console.log('Examples:');
  console.log(`  ${name} "npm run build" "npm run test"`);
  console.log(`  ${name} --streaming "echo hello" "echo world"`);
}

export default (argv: string[], name: string): undefined => {
  const options = getopts(argv, {
    alias: { silent: 'si', concurrency: 'c', expanded: 'e', streaming: 's', version: 'v', help: 'h' },
    boolean: ['silent', 'expanded', 'streaming', 'version', 'help'],
    default: { concurrency: name === 'dtd' ? 1 : Infinity },
    stopEarly: true,
  });

  if (options.version) {
    console.log(getVersion());
    exit(0);
    return;
  }

  if (options.help) {
    printHelp(name);
    exit(0);
    return;
  }

  const args = options._;
  if (!args.length) {
    console.log(`Missing command. Example usage: ${name} "[command1]" "[command2]" "[command3]"...`);
    exit(ERROR_CODE);
    return;
  }

  options.stdio = 'inherit'; // pass through stdio
  run(args, options as DisDatOptions, (err?: DisDatError, results?: DisDatResult[]): undefined => {
    if (err && !err.results) {
      console.log(err.message);
      exit(ERROR_CODE);
      return;
    }
    if (err) results = err.results;
    const errors = results.filter((result) => !!result.error);

    if (!options.silent) {
      // Load spawn-term to get figures/formatArguments for output formatting
      loadSpawnTerm((_loadErr, mod) => {
        const { createSession, figures, formatArguments } = mod || { createSession: undefined, figures: { tick: '✓', cross: '✗' }, formatArguments: (x: string[]) => x };
        if (!createSession) {
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
