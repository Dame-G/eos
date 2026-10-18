<script setup lang="ts">
import { computed, ref } from "vue";
import ENumberField from "../NumberField/ENumberField.vue";
import { useConfig } from "../../config.js";
import "../../styles/base.css";

const props = defineProps<{
  /** The visible label, a mono kicker above the field. The symbol is decoration, so say what the amount is for. */
  label: string;
  /** Keep the label for screen readers and remove it from the page. */
  hideLabel?: boolean;
  /** ISO 4217 code for the symbol. Default: the configured currency. */
  currency?: string;
  /** BCP 47 tag for the symbol. Default: the configured locale. */
  locale?: string;
  /** The lowest value. Default 0, so no negatives. */
  min?: number;
  /** The highest value. */
  max?: number;
  /** How far a button or arrow key moves the amount. Default 0.01. */
  step?: number;
  /** Replaces the currency symbol before the value. */
  prefix?: string;
  /** A unit after the value. */
  suffix?: string;
  /** The name submitted with a form (the number, or empty). */
  name?: string;
  /** Help that stays under the field. */
  hint?: string;
  /** What to fix. Replaces the hint, marks the field invalid and is announced. */
  error?: string;
  /** A word beside the label. */
  required?: boolean;
  /** A word beside the label. Flag whichever is rarer. */
  optional?: boolean;
  disabled?: boolean;
  /** The id of the input; the label points at it. Generated when left out. */
  id?: string;
}>();

/** The amount, or `null` when the field is empty. Round to the cent in code, not in the display. */
const model = defineModel<number | null>({ default: null });

const config = useConfig();
const field = ref<InstanceType<typeof ENumberField> | null>(null);

const symbol = computed(() => {
  try {
    const parts = new Intl.NumberFormat(props.locale || config.locale, {
      style: "currency",
      currency: props.currency || config.currency,
    }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? "$";
  } catch {
    return "$";
  }
});

defineExpose({
  /** The `<input>` element. */
  input: computed(() => field.value?.input ?? null),
  /** Puts the cursor in the input. */
  focus: () => field.value?.focus(),
});
</script>

<template>
  <ENumberField
    :id="id"
    ref="field"
    v-model="model"
    class="e-currency"
    :label="label"
    :hide-label="hideLabel"
    :min="min ?? 0"
    :max="max"
    :step="step ?? 0.01"
    :prefix="prefix ?? symbol"
    :suffix="suffix"
    :name="name"
    :hint="hint"
    :error="error"
    :required="required"
    :optional="optional"
    :disabled="disabled"
  />
</template>

<style>
@layer e.composites {
  /* Digits line up under each other in a column of amounts. */
  .e-currency .e-input {
    font-variant-numeric: tabular-nums;
  }
}
</style>
