import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from "vue";

/**
 * The `role` for a layout (EStack, EInline, EGrid) rendered `as="ul"` or `as="ol"`. The layout removes the bullets and
 * the padding (`.e-stack:is(ul, ol)` and the like), and a list without bullets loses its role in Safari, so it is given
 * back. Any other element gets no role.
 */
export function useListRole(as: MaybeRefOrGetter<string>): ComputedRef<"list" | undefined> {
  return computed(() => {
    const tag = toValue(as);
    return tag === "ul" || tag === "ol" ? "list" : undefined;
  });
}
