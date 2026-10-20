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
  /** ISO 4217 code. An unknown code falls back to the configured currency's symbol. @default configured currency */
  currency?: string;
  /** BCP 47 tag used for the symbol. @default configured locale */
  locale?: string;
  /** The lowest value, so no negatives by default. @default 0 */
  min?: number;
  /** The highest value. */
  max?: number;
  /** The size of one step of the buttons and arrow keys. Decimals shown follow the step. @default 0.01 */
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
  /** The `required` attribute and a word beside the label. */
  required?: boolean;
  /** A word beside the label. Flag whichever is rarer. */
  optional?: boolean;
  /** Disables the field and its buttons. */
  disabled?: boolean;
  /** The id of the input; the label points at it. @default generated */
  id?: string;
}>();

/** The amount; round to the cent in code. */
const model = defineModel<number | null>({ default: null });

const config = useConfig();
const field = ref<InstanceType<typeof ENumberField> | null>(null);

function symbolOf(locale: string, currency: string): string | undefined {
  try {
    const parts = new Intl.NumberFormat(locale, { style: "currency", currency }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value;
  } catch {
    return undefined;
  }
}

const symbol = computed(
  () =>
    symbolOf(props.locale || config.locale, props.currency || config.currency) ??
    symbolOf(config.locale, config.currency) ??
    config.currency,
);

defineExpose({
  input: computed(() => field.value?.input ?? null),
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
  .e-currency .e-input {
    font-variant-numeric: tabular-nums;
  }
}
</style>
