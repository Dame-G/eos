import { computed, watchEffect, type ComputedRef } from "vue";
import { isProduction } from "../env.js";

/** The size scale. A component that takes `size` accepts part of it, written `Extract<Size, "sm" | "md">`. */
export type Size = "sm" | "md" | "lg" | "xl";

/** The tones for status and emphasis. A component that takes `tone` accepts part of them, written `Extract<Tone, ...>`. */
export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

/** What a polymorphic `as` prop takes: the name of an HTML element, such as `section`, `ul` or `article`. */
export type ElementTag = keyof HTMLElementTagNameMap;

const warned = new Set<string>();

/** Logs `[eos] message` once per page, in development only. @internal */
export function warnOnce(message: string): void {
  if (isProduction() || warned.has(message)) return;
  warned.add(message);
  console.warn(`[eos] ${message}`);
}

/** What replaces a deprecated prop: the new spelling, or a function of the value that returns it (or nothing when that value is fine). */
type Replacement = string | ((value: unknown) => string | undefined);

/**
 * Warns once, in development, for each deprecated prop or value a component is given, and keeps watching so a prop set
 * later warns too. The old prop keeps working: this only says what to write instead.
 *
 * ```ts
 * useDeprecated("EAvatar", props, { small: 'size="sm"', status: "presence", tone: (v) => (v === "ink" ? 'tone="neutral"' : undefined) })
 * ```
 * @internal
 */
export function useDeprecated(component: string, props: object, replacements: Record<string, Replacement>): void {
  if (isProduction()) return;
  const values = props as Record<string, unknown>;
  watchEffect(() => {
    for (const [prop, replacement] of Object.entries(replacements)) {
      const value = values[prop];
      if (value === undefined || value === false) continue;
      if (typeof replacement === "function") {
        const use = replacement(value);
        if (use) warnOnce(`${component} ${prop}="${String(value)}" is deprecated. Use ${use}.`);
      } else warnOnce(`${component} \`${prop}\` is deprecated. Use ${replacement}.`);
    }
  });
}

/**
 * The size of a component that takes `size` and the older `small` and `large` flags. `size` wins. The flags are
 * deprecated: each warns once in development, and giving one together with `size` says that `size` wins.
 * @internal
 */
export function useSize<S extends Size = Size>(
  props: { size?: S | undefined; small?: boolean; large?: boolean },
  component: string,
  fallback: S = "md" as S,
): ComputedRef<S> {
  useDeprecated(component, props, { small: 'size="sm"', large: 'size="lg"' });
  if (!isProduction() && props.size && (props.small || props.large)) {
    warnOnce(`${component} got \`size\` and \`small\` or \`large\`. Use \`size\` alone; it wins.`);
  }
  return computed(() => props.size ?? ((props.small ? "sm" : props.large ? "lg" : fallback) as S));
}
