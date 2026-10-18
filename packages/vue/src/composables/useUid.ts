import { computed, toValue, useId, type ComputedRef, type MaybeRefOrGetter } from "vue";

/**
 * A stable id for wiring a label, hint and error to a control. Safe for SSR (it matches between server and client).
 * Pass the component's own `id` prop to let the consumer choose: `const id = useUid(() => props.id)`.
 */
export function useUid(given?: MaybeRefOrGetter<string | undefined>): ComputedRef<string> {
  const generated = useId();
  return computed(() => toValue(given) || `op-${generated}`);
}
