import type { DisDatCallback, DisDatError, DisDatOptions, DisDatResult } from './types.ts';
import worker from './worker.ts';

export * from './types.ts';

export default function disDat(commands: string[]): Promise<DisDatResult[]>;
export default function disDat(commands: string[], options: DisDatOptions): Promise<DisDatResult[]>;

export default function disDat(commands: string[], callback: DisDatCallback): void;
export default function disDat(commands: string[], options: DisDatOptions, callback: DisDatCallback): void;

export default function disDat(commands: string[], options?: DisDatOptions | DisDatCallback, callback?: DisDatCallback): void | Promise<DisDatResult[]> {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  if (typeof callback === 'function') return worker(commands, options, callback);
  return new Promise((resolve, reject) =>
    worker(commands, options as DisDatOptions, (err?: DisDatError, results?: DisDatResult[]): void => {
      err ? reject(err) : resolve(results);
    })
  );
}
