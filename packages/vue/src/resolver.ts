/**
 * Auto-import for `unplugin-vue-components`: `<AeButton>` in a template imports itself, so no `components:` registration is needed.
 *
 * ```ts
 * Components({ resolvers: [AegisResolver()] })
 * ```
 */
export function AegisResolver(options: { from?: string } = {}) {
  return {
    type: "component" as const,
    resolve(name: string) {
      if (/^Op[A-Z]/.test(name)) return { name, from: options.from ?? "@aegis/vue" };
      return undefined;
    },
  };
}
