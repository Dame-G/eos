import { isProduction } from "./env.js";

const warned = new Set<string>();

/** Logs `message` once per `key` in development, and nothing in production. */
export function warnOnce(key: string, message: string): void {
  if (isProduction() || warned.has(key)) return;
  warned.add(key);
  console.warn(`[eos] ${message}`);
}
