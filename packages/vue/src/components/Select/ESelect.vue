<script setup lang="ts">
import { computed } from "vue";
import EField from "../Field/EField.vue";
import ESelectControl from "./ESelectControl.vue";
import { normalizeOptions, type EOptionInput } from "./options.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import "../../styles/base.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** The visible label, a mono kicker above the control. Required unless `bare`. */
  label?: string;
  /** Keep the label for screen readers and remove it from the page. */
  hideLabel?: boolean;
  /** Strings, or `{ value, label, description, icon, group, disabled }`. A value is never an empty string. */
  options: readonly EOptionInput[];
  /** What the button says while nothing is chosen. Default "Select". */
  placeholder?: string;
  /** Help that stays under the control. */
  hint?: string;
  /** What to fix. Replaces the hint, marks the control invalid and is announced. */
  error?: string;
  /** A word beside the label. */
  required?: boolean;
  /** A word beside the label. Flag whichever is rarer. */
  optional?: boolean;
  disabled?: boolean;
  /** Submits the chosen value with a form (a hidden input carries it). */
  name?: string;
  /** Only the control, no label, hint or error. Give it `ariaLabel`. For dense places such as table filters. */
  bare?: boolean;
  /** The accessible name when `bare`. */
  ariaLabel?: string;
  /** The id of the button; the label points at it. Generated when left out. */
  id?: string;
}>();

/** The value of the chosen option. An empty string is nothing chosen. */
const model = defineModel<string>({ default: "" });

/** Whether the list is open. */
const open = defineModel<boolean>("open", { default: false });

const attrs = useFieldAttrs();
const options = computed(() => normalizeOptions(props.options));

type FieldSlot = { id: string; ariaInvalid: "true" | undefined; ariaDescribedby: string | undefined };
/** The button's own attributes, with the consumer's fall-through ones last. */
function triggerAttrs(field?: FieldSlot) {
  return {
    id: field?.id ?? props.id,
    "aria-invalid": field?.ariaInvalid,
    "aria-label": props.bare ? props.ariaLabel : undefined,
    ...attrs.input(field?.ariaDescribedby),
  };
}
</script>

<template>
  <div v-if="bare" v-bind="attrs.wrapper()">
    <ESelectControl
      v-model="model"
      v-model:open="open"
      :options="options"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :name="name"
      :label="ariaLabel ?? label"
      :trigger-attrs="triggerAttrs()"
    />
  </div>
  <EField
    v-else
    v-bind="attrs.wrapper()"
    :id="id"
    :label="label ?? ''"
    :hide-label="hideLabel"
    :hint="hint"
    :error="error"
    :required="required"
    :optional="optional"
  >
    <template #default="field">
      <ESelectControl
        v-model="model"
        v-model:open="open"
        :options="options"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :name="name"
        :label="label"
        :trigger-attrs="triggerAttrs(field)"
      />
    </template>
  </EField>
</template>
