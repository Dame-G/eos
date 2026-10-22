import { componentNames } from "./component-names.js";

/**
 * Auto-import for `unplugin-vue-components`: `<EButton>` in a template imports itself, so no `components:` registration is needed.
 * Only EOS's own component names are claimed, so your own `EHeader` or `EventCard` is left alone.
 *
 * ```ts
 * Components({ resolvers: [EosResolver()] })
 * ```
 *
 * The stylesheet is still imported once, in your entry file: `import "@eos-ui/vue/style.css"`.
 */
export function EosResolver(options: { from?: string } = {}) {
  return {
    type: "component" as const,
    resolve(name: string) {
      if (componentNames.has(name)) return { name, from: options.from ?? "@eos-ui/vue" };
      return undefined;
    },
  };
}
