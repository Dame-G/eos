// @internal: shared by the components, not exported from the package (see scripts/gen-index.mjs).
import { computed, toValue, type MaybeRefOrGetter, type Ref } from "vue";

export interface DetailsOptions {
  /** Details that share a group open one at a time (the native `name` of `details`). */
  group?: MaybeRefOrGetter<string | undefined>;
  /** Keeps it as it is: the summary no longer toggles it. */
  disabled?: MaybeRefOrGetter<boolean | undefined>;
}

/**
 * What a component built on `<details>` binds: `<details v-bind="details"><summary v-bind="summary">`. `open` is the
 * component's `v-model:open`; the native `toggle` event writes back to it, so a click, the keyboard, a `group` closing
 * its siblings and the model all stay in step. A disabled summary stays focusable (`aria-disabled`) and ignores the
 * click that Enter and Space also produce.
 */
export function useDetails(open: Ref<boolean | undefined>, options: DetailsOptions = {}) {
  const details = computed(() => ({
    name: toValue(options.group),
    open: open.value || undefined,
    onToggle: (e: Event) => {
      open.value = (e.target as HTMLDetailsElement).open;
    },
  }));
  const summary = computed<{ "aria-disabled"?: "true"; onClick?: (e: Event) => void }>(() =>
    toValue(options.disabled) ? { "aria-disabled": "true", onClick: (e) => e.preventDefault() } : {},
  );
  return { details, summary };
}
