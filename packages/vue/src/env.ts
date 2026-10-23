/**
 * True in a production build of the consumer's app. Reads `process.env.NODE_ENV`, which bundlers replace with a
 * literal (Vite, webpack, Rollup, esbuild, Nuxt) and Node sets at run time. Written in full so the replacement
 * matches. Vite replaces `import.meta.env.PROD` while building this library, which would freeze the answer
 * inside the published files, so it is not used here. With no `NODE_ENV` the answer is "not production".
 */
export function isProduction(): boolean {
  try {
    return typeof process !== "undefined" && process.env.NODE_ENV === "production";
  } catch {
    return false;
  }
}
