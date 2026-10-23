import { computed, type ComputedRef } from "vue";
import { isProduction } from "../env.js";

export type Size = "sm" | "md" | "lg";

/**
 * The size of a component that takes `size` and the older `small` and `large` flags. `size` wins; giving it together
 * with a flag warns in development. @internal
 */
export function useSize(
  props: { size?: Size; small?: boolean; large?: boolean },
  component: string,
): ComputedRef<Size> {
  if (!isProduction() && props.size && (props.small || props.large)) {
    console.warn(`[eos] ${component} got \`size\` and \`small\` or \`large\`. Use \`size\` alone; it wins.`);
  }
  return computed(() => props.size ?? (props.small ? "sm" : props.large ? "lg" : "md"));
}
