<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import ETextField from "../TextField/ETextField.vue";
import { useConfig, useMessages } from "../../config.js";
import "../../styles/base.css";

const props = defineProps<{
  /** The visible label, a mono kicker above the input. Default "Phone number". */
  label?: string;
  /** Keep the label for screen readers and remove it from the page. */
  hideLabel?: boolean;
  /** `us` groups the digits as you type, (555) 123-4567; `none` leaves them alone. Default `us` for the en-US locale, `none` otherwise. */
  format?: "us" | "none";
  /** Help that stays under the input. */
  hint?: string;
  /** What to fix. Replaces the hint, marks the input invalid and is announced. */
  error?: string;
  /** An example, never the label. */
  placeholder?: string;
  /** A word beside the label. */
  required?: boolean;
  /** A word beside the label. Flag whichever is rarer. */
  optional?: boolean;
  disabled?: boolean;
  /** The id of the input; the label points at it. Generated when left out. */
  id?: string;
}>();

const model = defineModel<string>({ default: "" });

const t = useMessages();
const config = useConfig();
const field = ref<InstanceType<typeof ETextField> | null>(null);

const style = computed(() => props.format || (/^en-US/i.test(config.locale) ? "us" : "none"));

function formatPhone(raw: string | null | undefined): string {
  let digits = String(raw || "").replace(/\D/g, "");
  if (style.value !== "us") return String(raw || "");
  if (digits.length > 10 && digits.charAt(0) === "1") digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const shown = computed(() => formatPhone(model.value));

async function onInput(value: string) {
  model.value = formatPhone(value);
  await nextTick();
  const el = field.value?.input;
  if (el && el.value !== shown.value) el.value = shown.value;
}

defineExpose({
  input: computed(() => field.value?.input ?? null),
  focus: () => field.value?.focus(),
});
</script>

<template>
  <ETextField
    :id="id"
    ref="field"
    class="e-phone"
    type="tel"
    inputmode="tel"
    autocomplete="tel"
    :label="label || t('phone')"
    :hide-label="hideLabel"
    :hint="hint"
    :error="error"
    :placeholder="placeholder"
    :required="required"
    :optional="optional"
    :disabled="disabled"
    :model-value="shown"
    @update:model-value="onInput"
  />
</template>

<style>
@layer e.composites {
  .e-phone .e-input {
    font-variant-numeric: tabular-nums;
  }
}
</style>
