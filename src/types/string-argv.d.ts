declare module 'string-argv' {
  function parseArgsStringToArgv(value: string, env?: string, file?: string): string[];
  export { parseArgsStringToArgv };
}
