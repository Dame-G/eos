<script setup lang="ts">
import { computed, ref } from "vue";
import ENumberField from "../NumberField/ENumberField.vue";
import type { EFieldBoxProps, EFieldCommonProps } from "../Field/fieldProps.js";
import { useConfig } from "../../config.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<
    EFieldCommonProps &
      Pick<EFieldBoxProps, "size"> & {
        /** The visible label. The symbol is decoration, so say what the amount is for. */
        label: string;
        /** ISO 4217 code. An unknown code falls back to the configured currency's symbol. @default configured currency */
        currency?: string;
        /** BCP 47 tag used for the symbol. @default configured locale */
        locale?: string;
        /** The lowest value. Use a negative number to allow negative amounts. @default 0 */
        min?: number;
        /** The highest value. */
        max?: number;
        /** The size of one step of the buttons and arrow keys. Decimals shown follow the step. @default the currency's smallest unit (0.01 for dollars, 1 for yen) */
        step?: number;
        /** Replaces the currency symbol before the value. */
        prefix?: string;
        /** A unit after the value. */
        suffix?: string;
        /** The name submitted with a form (the number, or empty). Posts nothing while disabled. */
        name?: string;
      }
  >(),
  { min: 0 },
);

/** The amount. Round to the cent in code. */
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

// The smallest unit the currency is written in: two decimals for most, none for the yen, three for the dinar.
const unit = computed(() => {
  try {
    const digits = new Intl.NumberFormat(props.locale || config.locale, {
      style: "currency",
      currency: props.currency || config.currency,
    }).resolvedOptions().maximumFractionDigits;
    return 10 ** -(digits ?? 2);
  } catch {
    return 0.01;
  }
});

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
    :min="min"
    :max="max"
    :step="step ?? unit"
    :prefix="prefix ?? symbol"
    :suffix="suffix"
    :name="name"
    :hint="hint"
    :error="error"
    :required="required"
    :optional="optional"
    :disabled="disabled"
    :readonly="readonly"
    :size="size"
  />
</template>

<style>
@layer e.composites {
  .e-currency .e-input {
    font-variant-numeric: tabular-nums;
  }
}
</style>
