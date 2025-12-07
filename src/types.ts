import type { SpawnOptions, SpawnResult } from 'cross-spawn-cb';

export interface DisDatResult {
  command: string;
  args: string[];
  version: string;
  result?: SpawnResult;
  error?: Error;
}

export interface DisDatError extends Error {
  results?: DisDatResult[];
}

export interface DisDatOptions extends SpawnOptions {
  concurrency?: number;
  streaming?: boolean;
  expanded?: boolean;
  interactive?: boolean;
  silent?: boolean;
}

export type DisDatCallback = (err?: DisDatError, results?: DisDatResult[]) => undefined;
