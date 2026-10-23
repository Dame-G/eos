import { componentNames } from "./component-names.js";

export interface EosResolverOptions {
  /** Module the components are imported from. Default `@eos-ui/vue`. */
  from?: string;
  /**
   * Also import the stylesheet whenever a component is auto-imported (`unplugin-vue-components` adds it as a side-effect import).
   * `true` imports `@eos-ui/vue/style.css`. A string imports that path instead. Default false: import the stylesheet once in your entry file.
   */
  css?: boolean | string;
}

/**
 * Auto-import for `unplugin-vue-components`: `<EButton>` in a template imports itself, so no `components:` registration is needed.
 * Only EOS's own component names are claimed, so your own `EHeader` or `EventCard` is left alone.
 *
 * ```ts
 * Components({ resolvers: [EosResolver()] })
 * ```
 *
 * The resolver does not import the stylesheet unless you pass `css: true`. Otherwise import it once in your entry file: `import "@eos-ui/vue/style.css"`.
 */
export function EosResolver(options: EosResolverOptions = {}) {
  const css = options.css === true ? "@eos-ui/vue/style.css" : options.css || undefined;
  return {
    type: "component" as const,
    resolve(name: string) {
      if (!componentNames.has(name)) return undefined;
      const from = options.from ?? "@eos-ui/vue";
      return css ? { name, from, sideEffects: css } : { name, from };
    },
  };
}
