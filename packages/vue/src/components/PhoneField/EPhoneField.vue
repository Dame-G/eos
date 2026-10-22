<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import ETextField from "../TextField/ETextField.vue";
import { useConfig, useMessages } from "../../config.js";
import "../../styles/base.css";

const props = defineProps<{
  /** The field's label. @default "Phone number" */
  label?: string;
  /** Hides the label from the page and keeps it for screen readers. */
  hideLabel?: boolean;
  /** `us` formats as (555) 123-4567, drops a leading 1 and keeps ten digits. It does not validate. @default us for the en-US locale, else none */
  format?: "us" | "none";
  /** Help that stays under the input. */
  hint?: string;
  /** What to fix. Replaces the hint, marks the input invalid and is announced. */
  error?: string;
  /** An example, never the label. */
  placeholder?: string;
  /** Sets the `required` attribute and shows "Required" beside the label. */
  required?: boolean;
  /** Shows "Optional" beside the label. Only the rarer of required and optional needs a flag. */
  optional?: boolean;
  /** Disables the field. */
  disabled?: boolean;
  /** The name submitted with a form. */
  name?: string;
  /** The id of the input. The label points at it. @default generated */
  id?: string;
}>();

/** The formatted number. */
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
    :name="name"
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
