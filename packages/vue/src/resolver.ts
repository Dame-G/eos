/**
 * Auto-import for `unplugin-vue-components`: `<EButton>` in a template imports itself, so no `components:` registration is needed.
 *
 * ```ts
 * Components({ resolvers: [EosResolver()] })
 * ```
 */
export function EosResolver(options: { from?: string } = {}) {
  return {
    type: "component" as const,
    resolve(name: string) {
      if (/^Op[A-Z]/.test(name)) return { name, from: options.from ?? "@eos-ui/vue" };
      return undefined;
    },
  };
}
