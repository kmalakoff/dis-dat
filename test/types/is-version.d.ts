declare module 'is-version' {
  function isVersion(version: string | undefined, prefix?: string): boolean;
  export = isVersion;
}
