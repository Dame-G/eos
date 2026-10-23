<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import ETextField from "../TextField/ETextField.vue";
import type { EFieldBoxProps, EFieldCommonProps } from "../Field/fieldProps.js";
import { useConfig, useMessages } from "../../config.js";
import "../../styles/base.css";

const props = defineProps<
  EFieldCommonProps &
    EFieldBoxProps & {
      /** The field's label. @default "Phone number" */
      label?: string;
      /** `us` formats as (555) 123-4567, drops a leading 1 (no US area code starts with 1) and keeps ten digits. `e164` keeps a `+` and up to 15 digits for an international number. `none` leaves the text alone. None of them validates. @default us for the en-US locale, else none */
      format?: "us" | "e164" | "none";
      /** An example, never the label. */
      placeholder?: string;
      /** What the model holds. `formatted` is the text as shown. `e164` is `+` and the digits, with the US `+1` added in the `us` format. `digits` is the digits alone. The input always shows the formatted number, and reads any of the three back. @default "formatted" */
      valueFormat?: "formatted" | "e164" | "digits";
      /** The name submitted with a form: the model, in the `valueFormat`. Posts nothing while disabled. */
      name?: string;
      /** Shows a button that empties the input while it has text. */
      clearable?: boolean;
    }
>();

/** The number, in the `valueFormat`. */
const model = defineModel<string>({ default: "" });

const t = useMessages();
const config = useConfig();
const field = ref<InstanceType<typeof ETextField> | null>(null);

const style = computed(() => props.format || (/^en-US/i.test(config.locale) ? "us" : "none"));

/** The leading 1 is always the country code in the US plan, so it is dropped as soon as it is typed. */
function usDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return (digits.startsWith("1") ? digits.slice(1) : digits).slice(0, 10);
}

function formatPhone(raw: string | null | undefined): string {
  const text = String(raw || "");
  if (style.value === "e164") {
    const digits = text.replace(/\D/g, "").slice(0, 15);
    return digits ? `+${digits}` : "";
  }
  if (style.value !== "us") return text;
  const digits = usDigits(text);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const shown = computed(() => formatPhone(model.value));

/** What the model gets for the number as shown. */
function stored(text: string): string {
  if (props.valueFormat !== "e164" && props.valueFormat !== "digits") return text;
  const digits = text.replace(/\D/g, "");
  if (props.valueFormat === "digits" || !digits) return digits;
  return style.value === "us" ? `+1${digits}` : `+${digits}`;
}

/** The caret offset in `formatted` that sits after the `count`-th digit. */
function caretAfter(formatted: string, count: number): number {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i]!) && ++seen === count) return i + 1;
  }
  return formatted.length;
}

async function onInput(value: string) {
  const el = field.value?.input ?? null;
  const caret = el?.selectionStart ?? value.length;
  let before = value.slice(0, caret).replace(/\D/g, "").length;
  if (style.value === "us" && value.replace(/\D/g, "").startsWith("1")) before = Math.max(0, before - 1);
  const next = formatPhone(value);
  model.value = stored(next);
  await nextTick();
  if (!el) return;
  if (el.value !== next) el.value = next;
  if (style.value !== "none" && document.activeElement === el && caret < value.length) {
    const at = caretAfter(next, before);
    el.setSelectionRange(at, at);
  }
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
    :readonly="readonly"
    :size="size"
    :loading="loading"
    :clearable="clearable"
    :name="name"
    :submit-value="valueFormat && valueFormat !== 'formatted' ? model : undefined"
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
