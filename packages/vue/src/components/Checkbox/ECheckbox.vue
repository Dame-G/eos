<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import EFieldFlag from "../Field/EFieldFlag.vue";
import EFieldMessage from "../Field/EFieldMessage.vue";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import { useUid } from "../../composables/useUid.js";
import { keepIfReadonly, useChoiceMessage } from "./useChoiceMessage.js";
import "../../styles/base.css";
import "./choice.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** What the person agrees to or turns on. */
  label: string;
  /** A line of detail under the label. */
  description?: string;
  /** A mixed state, such as select-all with some rows chosen. */
  indeterminate?: boolean;
  /** Hides the label from the page and keeps it for screen readers, for a table cell. It shows no hint or error text. */
  bare?: boolean;
  /** Disables the checkbox. It cannot take focus and is not submitted. */
  disabled?: boolean;
  /** Shows the state but blocks changing it. The box stays focusable and is still submitted. */
  readonly?: boolean;
  /** Sets the `required` attribute and shows "Required" beside the label. */
  required?: boolean;
  /** Shows "Optional" beside the label. Only the rarer of required and optional needs a flag. */
  optional?: boolean;
  /** Help under the row, linked with `aria-describedby`. */
  hint?: string;
  /** Shows what to fix under the row, in place of the hint, and sets `aria-invalid`. */
  error?: string;
  /** The name submitted with a form. */
  name?: string;
  /** The value submitted with a form when checked. */
  value?: string;
  /** The `id` of the input, which the label points at. @default generated */
  id?: string;
}>();

/** Whether it is checked. */
const model = defineModel<boolean>({ default: false });

const id = useUid(() => props.id);
const descId = computed(() => `${id.value}-desc`);
const message = computed(() => (props.bare ? {} : { hint: props.hint, error: props.error }));
const { messageId, describedBy } = useChoiceMessage(id, message);
const shownDescription = computed(() => (props.bare ? undefined : props.description));
const input = ref<HTMLInputElement | null>(null);
const attrs = useFieldAttrs();
const guard = keepIfReadonly(() => props.readonly);

watch(
  () => [props.indeterminate, input.value] as const,
  ([mixed, el]) => {
    if (el) el.indeterminate = !!mixed;
  },
  { flush: "post", immediate: true },
);

const inputBind = () => ({
  id: id.value,
  type: "checkbox" as const,
  class: "e-check",
  checked: model.value,
  value: props.value,
  required: props.required,
  disabled: props.disabled,
  name: props.name,
  "aria-readonly": props.readonly ? ("true" as const) : undefined,
  "aria-invalid": props.error ? ("true" as const) : undefined,
  ...attrs.input(describedBy(shownDescription.value && descId.value)),
});

// A click clears the native mixed state and checks the box. The props stay the truth: put both back once the parent has answered.
function onChange(e: Event) {
  const el = e.target as HTMLInputElement;
  model.value = el.checked;
  void nextTick(() => {
    el.checked = model.value;
    el.indeterminate = !!props.indeterminate;
  });
}

defineExpose({
  input,
  focus: () => input.value?.focus(),
});
</script>

<template>
  <div class="e-choice-wrap" :class="attrs.wrapper().class" :style="attrs.wrapper().style">
    <label class="e-choice" :class="{ 'e-choice--bare': bare, 'e-choice--disabled': disabled }" :for="id">
      <input ref="input" v-bind="inputBind()" @click="guard" @change="onChange" />
      <span v-if="bare" class="e-sr">{{ label }}</span>
      <span v-else class="e-choice-text">
        <span class="e-choice-label">
          {{ label }}
          <EFieldFlag :required="required" :optional="optional" />
        </span>
        <!-- Visible under the label, but kept out of its accessible name: the input points at it with aria-describedby. -->
        <span v-if="shownDescription" :id="descId" class="e-choice-desc" aria-hidden="true">{{ description }}</span>
      </span>
    </label>
    <EFieldMessage v-if="!bare" :id="messageId" :error="error" :hint="hint" />
  </div>
</template>

<style>
@layer e.controls {
  .e-choice--bare {
    min-height: 0;
    padding: 0;
    gap: 0;
    justify-content: center;
  }

  .e-choice-wrap {
    display: grid;
  }

  /* The row keeps its 48px tap height, so the message pulls up to sit gap-snug under the box. */
  .e-choice-wrap > .e-field-hint,
  .e-choice-wrap > .e-field-error {
    margin-block-start: calc(var(--e-gap-tight) - var(--e-gap-snug) - var(--e-stroke-focus));
  }
}
</style>
