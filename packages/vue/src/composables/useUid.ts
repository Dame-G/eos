import { computed, toValue, useId, type ComputedRef, type MaybeRefOrGetter } from "vue";

/**
 * A stable id for wiring a label, hint and error to a control. Safe for SSR (it matches between server and client).
 * Pass the component's own `id` prop to let the consumer choose: `const id = useUid(() => props.id)`.
 *
 * The path Vue builds (`v-0-0`) has its dashes turned into underscores. Components derive ids from this one by adding `-` and an index or a word (`-0`, `-label`), and two paths that are only a dash apart used to meet: one component's first option was `e-v-0-0` plus `-0`, and another component, in a later async boundary of the same page, was `e-v-0-0-0` itself. With underscores inside and a dash only for the suffix, no derived id can equal a generated one.
 */
export function useUid(given?: MaybeRefOrGetter<string | undefined>): ComputedRef<string> {
  const generated = useId();
  return computed(() => toValue(given) || `e-${generated.replaceAll("-", "_")}`);
}
