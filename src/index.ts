import type { DisDatCallback, DisDatError, DisDatOptions, DisDatResult } from './types.ts';
import worker from './worker.ts';

export * from './types.ts';

export default function disDat(commands: string[]): Promise<DisDatResult[]>;
export default function disDat(commands: string[], options: DisDatOptions): Promise<DisDatResult[]>;

export default function disDat(commands: string[], callback: DisDatCallback): undefined;
export default function disDat(commands: string[], options: DisDatOptions, callback: DisDatCallback): undefined;

export default function disDat(commands: string[], options?: DisDatOptions | DisDatCallback, callback?: DisDatCallback): undefined | Promise<DisDatResult[]> {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  if (typeof callback === 'function') return worker(commands, options, callback);
  return new Promise((resolve, reject) =>
    worker(commands, options, (err?: DisDatError, results?: DisDatResult[]): undefined => {
      err ? reject(err) : resolve(results);
    })
  );
}
