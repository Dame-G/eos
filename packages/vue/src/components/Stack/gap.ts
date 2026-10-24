import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from "vue";

/** A step of the space scale: `1` is `var(--e-space-1)`. */
export type SpaceToken = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
/** A semantic gap: `tight` 4px, `snug` 8px, `base` 12px, `loose` 16px, `section` 24px. They follow `density` and `spaceScale`. */
export type GapName = "tight" | "snug" | "base" | "loose" | "section";
export type GapToken = SpaceToken | GapName;

/** The CSS value for a gap: a name is `var(--e-gap-<name>)`, a number `var(--e-space-<n>)`, a string is used as given. */
function gapValue(gap: GapToken | string | undefined): string | undefined {
  if (gap === undefined) return undefined;
  if (typeof gap === "number") return `var(--e-space-${gap})`;
  return /^(tight|snug|base|loose|section)$/.test(gap) ? `var(--e-gap-${gap})` : gap;
}

export function useGap(gap: MaybeRefOrGetter<GapToken | string | undefined>): ComputedRef<string | undefined> {
  return computed(() => gapValue(toValue(gap)));
}
