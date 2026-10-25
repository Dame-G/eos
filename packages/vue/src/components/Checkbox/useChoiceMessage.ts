import { computed, ref, toValue, type MaybeRefOrGetter, type Ref } from "vue";
import type { EFieldCommonProps } from "../Field/fieldProps.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import { useUid } from "../../composables/useUid.js";
import { useFormField } from "../../composables/useFormContext.js";

/** What ECheckbox and ESwitch share. */
export interface ChoiceProps extends EFieldCommonProps {
  label: string;
  description?: string | undefined;
  name?: string | undefined;
  value?: string | undefined;
}

/**
 * The script of a checkbox-like row (ECheckbox, ESwitch). Render it with `EChoiceRow v-bind="choice.row()"` and put
 * `<input ref="input" v-bind="choice.bind()" @click="choice.guard" />` in its slot.
 */
export function useChoice(props: ChoiceProps) {
  const id = useUid(() => props.id);
  const descId = computed(() => `${id.value}-desc`);
  const description = computed(() => props.description);
  const { messageId, describedBy } = useChoiceMessage(id, () => ({ hint: props.hint, error: props.error }));
  const attrs = useFieldAttrs();
  const input = ref<HTMLInputElement | null>(null);
  useFormField({ id: () => id.value, label: () => props.label, error: () => props.error });
  return {
    id,
    input,
    guard: keepIfReadonly(() => props.readonly),
    /** The props of EChoiceRow, with the consumer's class and style for its wrapper. */
    row: () => ({
      ...attrs.wrapper(),
      id: id.value,
      label: props.label,
      description: description.value,
      descId: descId.value,
      messageId: messageId.value,
      hideLabel: props.hideLabel,
      disabled: props.disabled,
      required: props.required,
      optional: props.optional,
      hint: props.hint,
      error: props.error,
    }),
    /** The input's attributes. The consumer's own come last, so they win. Spread the kind's own (`class`, `role`) before. */
    bind: (): Record<string, unknown> => ({
      id: id.value,
      type: "checkbox",
      name: props.name,
      value: props.value,
      required: props.required,
      disabled: props.disabled,
      "aria-readonly": props.readonly ? "true" : undefined,
      "aria-invalid": props.error ? "true" : undefined,
      ...attrs.input(describedBy(description.value && descId.value)),
    }),
    exposed: { input, focus: () => input.value?.focus() },
  };
}

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
