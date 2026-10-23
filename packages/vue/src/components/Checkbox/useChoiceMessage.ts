import { computed, toValue, type MaybeRefOrGetter, type Ref } from "vue";

/**
 * The message under a checkbox, switch or segmented control: one id for the hint or error, joined into
 * `aria-describedby` with the other descriptions, so none of them is folded into the accessible name.
 */
export function useChoiceMessage(
  id: Ref<string>,
  source: MaybeRefOrGetter<{ hint?: string | undefined; error?: string | undefined }>,
) {
  const messageId = computed(() => `${id.value}-hint`);
  const describedBy = (...extra: (string | false | undefined)[]) => {
    const { hint, error } = toValue(source);
    return [(error || hint) && messageId.value, ...extra].filter(Boolean).join(" ") || undefined;
  };
  return { messageId, describedBy };
}

/** A read-only choice keeps its value and focus but cannot be changed: cancel the click that would toggle it. */
export function keepIfReadonly(readonly: () => boolean | undefined) {
  return (e: Event) => {
    if (readonly()) e.preventDefault();
  };
}
