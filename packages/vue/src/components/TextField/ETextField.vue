<script setup lang="ts">
import { computed } from "vue";
import EField from "../Field/EField.vue";
import EFieldCount from "../Field/EFieldCount.vue";
import EInputClear from "../Field/EInputClear.vue";
import EInputShell from "../Field/EInputShell.vue";
import type { EFieldBoxProps, EFieldCommonProps } from "../Field/fieldProps.js";
import { useFieldControl, type FieldSlot } from "../../composables/useFieldControl.js";
import "../../styles/base.css";
import "./input.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  EFieldCommonProps &
    EFieldBoxProps & {
      /** The visible label above the input. A placeholder never replaces it. */
      label: string;
      /** An example, never the label. */
      placeholder?: string;
      /** The input type. @default "text" */
      type?: string;
      /** A unit before the value, such as `$`. Read as part of the input's description. */
      prefix?: string;
      /** A unit after the value, such as `USD`. Read as part of the input's description. */
      suffix?: string;
      /** The name submitted with a form. */
      name?: string;
      /** Posts this under `name` instead of the text in the input, for an input that shows a formatted number and posts the plain one. The input itself is then not named. */
      submitValue?: string;
      /** What the browser may fill in (`email`, `given-name`, `off`). Set it on every personal detail (WCAG 1.3.5). */
      autocomplete?: string;
      /** The most characters the input takes. */
      maxlength?: number;
      /** Shows how many characters there are, out of `maxlength` when it is set. */
      counter?: boolean;
      /** Shows a button that empties the input while it has text. */
      clearable?: boolean;
    }
>();

const emit = defineEmits<{
  /** The person pressed the clear button. The model is already empty. */
  clear: [];
}>();

/** The text. */
const model = defineModel<string>({ default: "" });

const control = useFieldControl(props);
const input = control.input;
/** A box around the input is only drawn when something sits beside it. */
const boxed = computed(() => !!(props.prefix || props.suffix || props.clearable || props.loading));
const canClear = computed(() => props.clearable && model.value !== "" && !props.disabled && !props.readonly);

function inputBind(field: FieldSlot) {
  return {
    class: "e-input",
    type: props.type || "text",
    placeholder: props.placeholder,
    value: model.value,
    autocomplete: props.autocomplete,
    maxlength: props.maxlength,
    name: props.submitValue === undefined ? props.name : undefined,
    ...control.bind(field, [
      props.prefix && `${field.id}-prefix`,
      props.suffix && `${field.id}-suffix`,
      props.counter && `${field.id}-count`,
    ]),
  };
}
function clear() {
  model.value = "";
  emit("clear");
  input.value?.focus();
}
defineExpose(control.exposed);
</script>

<template>
  <EField
    v-bind="control.attrs.wrapper()"
    :id="id"
    :label="label"
    :hide-label="hideLabel"
    :hint="hint"
    :error="error"
    :required="required"
    :optional="optional"
  >
    <template #default="field">
      <EInputShell v-if="boxed" v-bind="control.shell(error)">
        <span v-if="prefix" :id="`${field.id}-prefix`" class="e-affix e-affix--pre">{{ prefix }}</span>
        <input ref="input" v-bind="inputBind(field)" @input="model = ($event.target as HTMLInputElement).value" />
        <EInputClear v-if="canClear" @click="clear" />
        <span v-if="suffix" :id="`${field.id}-suffix`" class="e-affix e-affix--post">{{ suffix }}</span>
      </EInputShell>
      <input v-else ref="input" v-bind="inputBind(field)" @input="model = ($event.target as HTMLInputElement).value" />
      <input v-if="name && submitValue !== undefined" type="hidden" v-bind="control.hidden(name, submitValue)" />
    </template>
    <template v-if="counter" #aside="{ id: fieldId }">
      <EFieldCount :id="`${fieldId}-count`" :count="model.length" :max="maxlength" />
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
