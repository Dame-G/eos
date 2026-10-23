<script setup lang="ts">
import { ref } from "vue";
import EField from "../Field/EField.vue";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import "../../styles/base.css";
import "../TextField/input.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The visible label above the textarea. */
    label: string;
    /** Keeps the label for screen readers and hides it from the page. */
    hideLabel?: boolean;
    /** Help that stays under the textarea. */
    hint?: string;
    /** What to fix. Replaces the hint, marks the textarea invalid and is announced. */
    error?: string;
    /** An example, never the label. */
    placeholder?: string;
    /** Visible lines. The height follows it, down to one. */
    rows?: number;
    /** Sets the `required` attribute and adds a word beside the label. */
    required?: boolean;
    /** Adds a word beside the label. Use it when most fields in the form are required. */
    optional?: boolean;
    /** Disables the field. */
    disabled?: boolean;
    /** Shows the text but blocks editing. The textarea stays focusable and selectable. */
    readonly?: boolean;
    /** The id of the textarea, which the label points at. @default generated */
    id?: string;
  }>(),
  { rows: 4 },
);

/** The text. */
const model = defineModel<string>({ default: "" });

const input = ref<HTMLTextAreaElement | null>(null);
const attrs = useFieldAttrs();
function inputBind(field: { id: string; ariaInvalid: "true" | undefined; ariaDescribedby: string | undefined }) {
  return {
    id: field.id,
    class: "e-input e-textarea",
    rows: props.rows,
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
      <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
      <textarea ref="input" v-bind="inputBind(field)" @input="model = ($event.target as HTMLTextAreaElement).value" />
    </template>
  </EField>
</template>

<style>
@layer e.controls {
  .e-textarea {
    /* The height comes from `rows` (a line is 1.5 tall), so 2 rows is shorter than 4. */
    height: auto;
    padding: calc(var(--e-space-3) - var(--e-stroke-edge)) calc(var(--e-space-4) - var(--e-stroke-edge));
    line-height: 1.5;
    resize: vertical;
  }
}
</style>
