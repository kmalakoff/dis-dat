import spawn, { type SpawnOptions, type SpawnResult } from 'cross-spawn-cb';
import Queue from 'queue-cb';
import spawnStreaming from 'spawn-streaming';
import { createSession, formatArguments } from 'spawn-term';
import { parseArgsStringToArgv } from 'string-argv';

const bracketsRegEx = /\{([\s\S]*)\}/;

import type { DisDatCallback, DisDatError, DisDatOptions, DisDatResult } from './types.ts';

export default function worker(commands: string[], options: DisDatOptions, callback: DisDatCallback): void {
  const spawnOptions = { cwd: process.cwd(), ...options } as SpawnOptions;
  let results: DisDatResult[] = [];
  const queue = new Queue(options.concurrency || Infinity);

  // Create session once for all processes (only if multiple commands)
  const interactive = !!options.interactive;
  const session = commands.length >= 2 && process.stdout.isTTY && typeof createSession === 'function' && !options.streaming ? createSession({ header: commands.join(' | '), interactive }) : null;

  commands.forEach((_, index) => {
    queue.defer((cb) => {
      const match = commands[index].match(bracketsRegEx);
      const argv = match ? parseArgsStringToArgv(match[1]) : parseArgsStringToArgv(commands[index]);
      const command = argv[0];
      const args = argv.slice(1);
      const prefix = formatArguments(argv).join(' ');

      function next(err?: Error | null, res?: SpawnResult): void {
        if (err && err.message.indexOf('ExperimentalWarning') >= 0) {
          res = err as unknown as SpawnResult;
          err = null;
        }

        // suppress error
        if (err && match) {
          res = err as unknown as SpawnResult;
          err = null;
        }

        results.push({ index, command, args, error: err ?? undefined, result: res });
        if (err && options.concurrency === 1) {
          cb(err); // break early
          return;
        }
        cb();
      }

      if (!session && !options.silent) console.log(`${index > 0 ? '\n' : ''}$ ${formatArguments([command].concat(args)).join(' ')}`);

      // Show command when running single command (no terminal session, unless silent)
      if (commands.length < 2) spawn(command, args, spawnOptions, next);
      else if (session) session.spawn(command, args, spawnOptions, { group: prefix, expanded: options.expanded }, next);
      else spawnStreaming(command, args, spawnOptions, { prefix: process.stdout.isTTY ? prefix : undefined }, next);
    });
  });

  queue.await((err) => {
    results = results.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    if (err) (err as DisDatError).results = results;
    if (session) {
      session.waitAndClose(() => {
        err ? callback(err) : callback(undefined, results);
      });
    } else {
      err ? callback(err) : callback(undefined, results);
    }
  });
}
