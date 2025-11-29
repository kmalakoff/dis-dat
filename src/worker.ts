import spawn, { type SpawnOptions } from 'cross-spawn-cb';
import Queue from 'queue-cb';
import spawnStreaming from 'spawn-streaming';
import { parseArgsStringToArgv } from 'string-argv';
import loadSpawnTerm from './lib/loadSpawnTerm.ts';

const bracketsRegEx = /\{([\s\S]*)\}/;

import type { DisDatCallback, DisDatError, DisDatOptions } from './types.ts';

export default function worker(commands: string[], options: DisDatOptions, callback: DisDatCallback): undefined {
  // Load spawn-term lazily
  loadSpawnTerm((loadErr, mod) => {
    if (loadErr) return callback(loadErr);
    const createSession = mod.createSession;

    const spawnOptions = { cwd: process.cwd(), ...options } as SpawnOptions;
    let results = [];
    const queue = new Queue(options.concurrency || Infinity);

    // Create session once for all processes (only if multiple commands)
    const session = commands.length >= 2 && createSession && !options.streaming ? createSession({ header: commands.join(' | ') }) : null;

    commands.forEach((_, index) => {
      queue.defer((cb) => {
        const match = commands[index].match(bracketsRegEx);
        const argv = match ? parseArgsStringToArgv(match[1]) : parseArgsStringToArgv(commands[index]);
        const command = argv[0];
        const args = argv.slice(1);
        const prefix = argv.join(' ');

        function next(err?, res?): undefined {
          if (err && err.message.indexOf('ExperimentalWarning') >= 0) {
            res = err;
            err = null;
          }

          // suppress error
          if (err && match) {
            res = err;
            err = null;
          }

          results.push({ index, command, args, error: err, result: res });
          if (err && options.concurrency === 1) {
            cb(err); // break early
            return;
          }
          cb();
        }

        if (commands.length < 2) spawn(command, args, spawnOptions, next);
        else if (session) session.spawn(command, args, spawnOptions, { expanded: options.expanded }, next);
        else spawnStreaming(command, args, spawnOptions, { prefix }, next);
      });
    });

    queue.await((err) => {
      results = results.sort((a, b) => a.index - b.index);
      if (err) (err as DisDatError).results = results;
      if (session) {
        session.waitAndClose(() => {
          err ? callback(err) : callback(null, results);
        });
      } else {
        err ? callback(err) : callback(null, results);
      }
    });
  });
}
