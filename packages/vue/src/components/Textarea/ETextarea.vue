<script setup lang="ts">
import { ref } from "vue";
import EField from "../Field/EField.vue";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import "../../styles/base.css";
import "../TextField/input.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The visible label, a mono kicker above the text well. */
    label: string;
    /** Keep the label for screen readers and remove it from the page. */
    hideLabel?: boolean;
    /** Help that stays under the text well. */
    hint?: string;
    /** What to fix. Replaces the hint, marks the textarea invalid and is announced. */
    error?: string;
    /** An example, never the label. */
    placeholder?: string;
    /** Visible lines. */
    rows?: number;
    /** A word beside the label. */
    required?: boolean;
    /** A word beside the label. Flag whichever is rarer. */
    optional?: boolean;
    disabled?: boolean;
    /** The id of the textarea; the label points at it. Generated when left out. */
    id?: string;
  }>(),
  { rows: 4 },
);

/** The text in the textarea. */
const model = defineModel<string>({ default: "" });

const input = ref<HTMLTextAreaElement | null>(null);
const attrs = useFieldAttrs();
/** The textarea's own attributes, with the consumer's fall-through ones last. */
function inputBind(field: { id: string; ariaInvalid: "true" | undefined; ariaDescribedby: string | undefined }) {
  return {
    id: field.id,
    class: "e-input e-textarea",
    rows: props.rows,
    placeholder: props.placeholder,
    value: model.value,
    disabled: props.disabled,
    required: props.required,
    "aria-invalid": field.ariaInvalid,
    ...attrs.input(field.ariaDescribedby),
  };
}
defineExpose({
  /** The `<textarea>` element. */
  input,
  /** Puts the cursor in the textarea. */
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
    height: auto;
    min-height: 6.5rem;
    padding: var(--e-space-3) var(--e-space-4);
    line-height: 1.5;
    resize: vertical;
  }
}
</style>
