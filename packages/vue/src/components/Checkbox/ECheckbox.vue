<script setup lang="ts">
import { nextTick, watch } from "vue";
import EChoiceRow from "./EChoiceRow.vue";
import type { EFieldCommonProps } from "../Field/fieldProps.js";
import { useChoice } from "./useChoiceMessage.js";
import "../../styles/base.css";
import "./choice.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  Omit<EFieldCommonProps, "hideLabel"> & {
    /** What the person agrees to or turns on. */
    label: string;
    /** A line of detail under the label. */
    description?: string;
    /** A mixed state, such as select-all with some rows chosen. */
    indeterminate?: boolean;
    /** Hides the label from the page and keeps it for screen readers, for a table cell. It shows no hint or error text. */
    bare?: boolean;
    /** The name submitted with a form. */
    name?: string;
    /** The value submitted with a form when checked. */
    value?: string;
  }
>();

/** Whether it is checked. */
const model = defineModel<boolean>({ default: false });

const choice = useChoice(props);
const input = choice.input;

watch(
  () => [props.indeterminate, input.value] as const,
  ([mixed, el]) => {
    if (el) el.indeterminate = !!mixed;
  },
  { flush: "post", immediate: true },
);

// A click clears the native mixed state and checks the box. The props stay the truth: put both back once the parent has answered.
function onChange(e: Event) {
  const el = e.target as HTMLInputElement;
  model.value = el.checked;
  void nextTick(() => {
    el.checked = model.value;
    el.indeterminate = !!props.indeterminate;
  });
}

defineExpose(choice.exposed);
</script>

<template>
  <EChoiceRow v-bind="choice.row()">
    <input
      ref="input"
      class="e-check"
      :checked="model"
      v-bind="choice.bind()"
      @click="choice.guard"
      @change="onChange"
    />
  </EChoiceRow>
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
