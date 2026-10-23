import "../src/styles/base.css";
import { afterEach } from "vitest";

// Vue warns when a component is made a reactive object: a fixture passed as a prop or put in the config without markRaw.
// It costs a proxy on every render, so a test that does it fails, and the fixture is wrapped in markRaw.
const warn = console.warn;
let reactiveComponents: string[] = [];
console.warn = (...args: unknown[]) => {
  const text = args.map(String).join(" ");
  if (/made a reactive object/.test(text)) reactiveComponents.push(text.split("\n")[0]!);
  warn(...args);
};
afterEach(() => {
  const found = reactiveComponents;
  reactiveComponents = [];
  if (found.length) throw new Error(`A component was made reactive (wrap it in markRaw): ${found[0]}`);
});
