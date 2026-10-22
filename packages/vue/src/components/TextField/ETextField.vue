<script setup lang="ts">
import { ref } from "vue";
import EField from "../Field/EField.vue";
import { focusInside } from "../../composables/focusInside.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import "../../styles/base.css";
import "./input.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** The visible label above the input. A placeholder never replaces it. */
  label: string;
  /** Keeps the label for screen readers and hides it from the page. */
  hideLabel?: boolean;
  /** Help that stays under the input. */
  hint?: string;
  /** What to fix. Replaces the hint, marks the input invalid and is announced. */
  error?: string;
  /** An example, never the label. */
  placeholder?: string;
  /** The input type. @default "text" */
  type?: string;
  /** A unit before the value, such as `$`. Hidden from screen readers. */
  prefix?: string;
  /** A unit after the value, such as `USD`. Hidden from screen readers. */
  suffix?: string;
  /** Sets the `required` attribute and adds a word beside the label. */
  required?: boolean;
  /** Adds a word beside the label. Use it when most fields in the form are required. */
  optional?: boolean;
  /** Disables the field. */
  disabled?: boolean;
  /** Shows the value but blocks editing. The input stays focusable and selectable. */
  readonly?: boolean;
  /** The id of the input, which the label points at. @default generated */
  id?: string;
}>();

/** The text. */
const model = defineModel<string>({ default: "" });

const input = ref<HTMLInputElement | null>(null);
const attrs = useFieldAttrs();
function inputBind(field: { id: string; ariaInvalid: "true" | undefined; ariaDescribedby: string | undefined }) {
  return {
    id: field.id,
    class: "e-input",
    type: props.type || "text",
    placeholder: props.placeholder,
    value: model.value,
    disabled: props.disabled,
    readonly: props.readonly,
    required: props.required,
    "aria-invalid": field.ariaInvalid,
    ...attrs.input(field.ariaDescribedby),
  };
}
defineExpose({
  input,
  focus: () => input.value?.focus(),
});
</script>

<template>
  <EField
    v-bind="attrs.wrapper()"
    :id="id"
    :label="label"
    :hide-label="hideLabel"
    :hint="hint"
    :error="error"
    :required="required"
    :optional="optional"
  >
    <template #default="field">
      <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
      <div
        v-if="prefix || suffix"
        class="e-input-wrap"
        :data-invalid="error ? '' : undefined"
        :data-disabled="disabled ? '' : undefined"
        :data-readonly="readonly ? '' : undefined"
        @click="focusInside"
      >
        <span v-if="prefix" class="e-affix e-affix--pre" aria-hidden="true">{{ prefix }}</span>
        <input ref="input" v-bind="inputBind(field)" @input="model = ($event.target as HTMLInputElement).value" />
        <span v-if="suffix" class="e-affix e-affix--post" aria-hidden="true">{{ suffix }}</span>
      </div>
      <input v-else ref="input" v-bind="inputBind(field)" @input="model = ($event.target as HTMLInputElement).value" />
    </template>
  </EField>
</template>

<style>
@layer e.controls {
  .e-input[type="number"],
  .e-input[inputmode="numeric"],
  .e-input[inputmode="decimal"] {
    font-variant-numeric: tabular-nums;
  }
}
</style>
