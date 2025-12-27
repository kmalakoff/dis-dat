import type { DisDatCallback, DisDatError, DisDatOptions, DisDatResult } from './types.ts';
import worker from './worker.ts';

export * from './types.ts';

export default function disDat(commands: string[]): Promise<DisDatResult[]>;
export default function disDat(commands: string[], options: DisDatOptions): Promise<DisDatResult[]>;

export default function disDat(commands: string[], callback: DisDatCallback): void;
export default function disDat(commands: string[], options: DisDatOptions, callback: DisDatCallback): void;

export default function disDat(commands: string[], options?: DisDatOptions | DisDatCallback, callback?: DisDatCallback): void | Promise<DisDatResult[]> {
  callback = typeof options === 'function' ? options : callback;
  options = typeof options === 'function' ? {} : ((options || {}) as DisDatOptions);

  if (typeof callback === 'function') return worker(commands, options, callback);
  return new Promise((resolve, reject) => worker(commands, options, (err?: DisDatError, results?: DisDatResult[]): void => (err ? reject(err) : resolve(results))));
}
