import exit from 'exit-compat';
import { readFileSync } from 'fs';
import getopts from 'getopts-compat';
import Module from 'module';
import path from 'path';
import url from 'url';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
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

export default (argv: string[], name: string): void => {
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
  const report = (err?: DisDatError | Error | null, results?: DisDatResult[]): void => {
    const ddErr = err as DisDatError | undefined;
    if (ddErr && !ddErr.results) {
      console.log(ddErr.message);
      exit(ERROR_CODE);
      return;
    }
    const allResults = (ddErr ? ddErr.results : results) ?? [];
    const errors = allResults.filter((result) => !!result.error);

    if (!options.silent) {
      // deferred: spawn-term's session/formatting helpers are only needed to report run results
      const { createSession, figures, formatArguments } = _require('spawn-term');
      if (!createSession) {
        console.log('\n======================');
        allResults.forEach((res) => {
          console.log(`${res.error ? figures.cross : figures.tick} ${formatArguments([res.command].concat(res.args))}${res.error ? ` Error: ${res.error.message}` : ''}`);
        });
        console.log('\n----------------------');
        console.log(`${name} ${formatArguments(args).join(' ')}`);
        console.log(`${figures.tick} ${allResults.length - errors.length} succeeded`);
        if (errors.length) console.log(`${figures.cross} ${errors.length} failed`);
      }
    }
    exit(err || errors.length ? ERROR_CODE : 0);
  };
  // deferred: index.ts pulls the whole spawn pipeline. require() cannot load this ESM sibling below
  // Node 20.19 (require(esm)), so the ESM half needs a real dynamic import; the CJS half's sibling
  // is genuine CommonJS, so a plain synchronous require avoids depending on Promise, which isn't
  // global before Node 0.12.
  loadIndex((err, run) => (err || !run ? report(err) : run(args, options as DisDatOptions, report)));
};

type RunFn = (commands: string[], options: DisDatOptions, callback: (err?: DisDatError | Error | null, results?: DisDatResult[]) => void) => void;

function loadIndex(callback: (err: Error | null, run?: RunFn) => void): void {
  if (typeof require === 'undefined') {
    import('./index.js').then((mod) => callback(null, mod.default || mod)).catch((err) => callback(err instanceof Error ? err : new Error(String(err))));
  } else {
    try {
      const mod = require('./index.js');
      callback(null, mod.default || mod);
    } catch (err) {
      callback(err instanceof Error ? err : new Error(String(err)));
    }
  }
}
