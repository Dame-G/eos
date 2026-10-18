<script setup lang="ts">
import { ref } from "vue";
import AeField from "../Field/AeField.vue";
import { focusInside } from "../../composables/focusInside.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import "../../styles/base.css";
import "./input.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** The visible label, a mono kicker above the input. */
  label: string;
  /** Keep the label for screen readers and remove it from the page. */
  hideLabel?: boolean;
  /** Help that stays under the input. */
  hint?: string;
  /** What to fix. Replaces the hint, marks the input invalid and is announced. */
  error?: string;
  /** An example, never the label. */
  placeholder?: string;
  /** The input type. */
  type?: string;
  /** A unit before the value, such as $. */
  prefix?: string;
  /** A unit after the value, such as USD. */
  suffix?: string;
  /** A word beside the label. */
  required?: boolean;
  /** A word beside the label. Flag whichever is rarer. */
  optional?: boolean;
  disabled?: boolean;
  /** The id of the input; the label points at it. Generated when left out. */
  id?: string;
}>();

/** The text in the input. */
const model = defineModel<string>({ default: "" });

const input = ref<HTMLInputElement | null>(null);
const attrs = useFieldAttrs();
/** The input's own attributes, with the consumer's fall-through ones last. */
function inputBind(field: { id: string; ariaInvalid: "true" | undefined; ariaDescribedby: string | undefined }) {
  return {
    id: field.id,
    class: "ae-input",
    type: props.type || "text",
    placeholder: props.placeholder,
    value: model.value,
    disabled: props.disabled,
    required: props.required,
    "aria-invalid": field.ariaInvalid,
    ...attrs.input(field.ariaDescribedby),
  };
}
defineExpose({
  /** The `<input>` element. */
  input,
  /** Puts the cursor in the input. */
  focus: () => input.value?.focus(),
});
</script>

<template>
  <AeField
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
        class="ae-input-wrap"
        :data-invalid="error ? '' : undefined"
        :data-disabled="disabled ? '' : undefined"
        @click="focusInside"
      >
        <span v-if="prefix" class="ae-affix ae-affix--pre" aria-hidden="true">{{ prefix }}</span>
        <input ref="input" v-bind="inputBind(field)" @input="model = ($event.target as HTMLInputElement).value" />
        <span v-if="suffix" class="ae-affix ae-affix--post" aria-hidden="true">{{ suffix }}</span>
      </div>
      <input v-else ref="input" v-bind="inputBind(field)" @input="model = ($event.target as HTMLInputElement).value" />
    </template>
  </AeField>
</template>

<style>
@layer ae.controls {
  .ae-input[type="number"],
  .ae-input[inputmode="numeric"],
  .ae-input[inputmode="decimal"] {
    font-variant-numeric: tabular-nums;
  }
}
</style>
