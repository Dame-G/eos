/**
 * True in a production build of the consumer's app. Reads `process.env.NODE_ENV`, which bundlers replace with a
 * literal (Vite, webpack, Rollup, esbuild, Nuxt) and Node sets at run time. Written in full, with no `typeof process`
 * guard: a bundler replaces `process.env.NODE_ENV` but not `typeof process`, so a guard made the answer "not production"
 * in every browser bundle. Where nothing replaced it and there is no `process` (a script tag in a browser), the lookup
 * throws and the answer is "not production". Vite replaces `import.meta.env.PROD` while building this library, which
 * would freeze the answer inside the published files, so it is not used here.
 */
export function isProduction(): boolean {
  try {
    return process.env.NODE_ENV === "production";
  } catch {
    return false;
  }
}

const warned = new Set<string>();

/** Logs `message` once per `key` in development, and nothing in production. */
export function warnOnce(key: string, message: string): void {
  if (isProduction() || warned.has(key)) return;
  warned.add(key);
  console.warn(`[eos] ${message}`);
}
