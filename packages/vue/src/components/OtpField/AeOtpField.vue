<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import AeField from "../Field/AeField.vue";
import { useMessages } from "../../config.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import "../../styles/base.css";
import "../TextField/input.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The visible label. "Verification code" when left out. */
    label?: string;
    /** How many characters. */
    length?: number;
    /** `numeric` opens the number pad; `text` takes letters and digits. */
    type?: "numeric" | "text";
    /** A gap between groups: 6 with 3 reads 123 456. */
    groupSize?: number;
    /** The name submitted with a form (the whole code). */
    name?: string;
    /** Start in the first empty box. */
    autoFocus?: boolean;
    /** Help under the boxes, read with each box. */
    hint?: string;
    /** What to fix. Replaces the hint and is announced. */
    error?: string;
    disabled?: boolean;
    /** The id of the first box; the label and hint ids are built from it. Generated when left out. */
    id?: string;
  }>(),
  { length: 6, type: "numeric", groupSize: 0 },
);

const emit = defineEmits<{
  /** Once, when the last box fills. */
  complete: [code: string];
}>();

/** The code typed so far. */
const model = defineModel<string>({ default: "" });

const t = useMessages();
const attrs = useFieldAttrs();
const numeric = computed(() => props.type !== "text");
const refs: (HTMLInputElement | null)[] = [];

function clean(s: unknown): string {
  const text = String(s ?? "");
  return (numeric.value ? text.replace(/\D/g, "") : text.replace(/[^a-z0-9]/gi, "").toUpperCase()).slice(
    0,
    props.length,
  );
}
const value = computed(() => clean(model.value));

/** The latest code, updated the moment it changes: focus moves before the parent re-renders, so handlers must not read a stale value. */
let live = value.value;
watch(value, (v) => (live = v), { flush: "sync" });

function commit(next: string) {
  next = clean(next);
  const prev = live;
  live = next;
  model.value = next;
  if (next.length === props.length && prev !== next) emit("complete", next);
}
function focusAt(i: number) {
  refs[Math.max(0, Math.min(props.length - 1, i))]?.focus();
}
const without = (v: string, i: number) => v.slice(0, i) + v.slice(i + 1);
function put(i: number, text: string) {
  const chars = clean(text);
  if (!chars) return;
  const from = chars.length >= props.length ? 0 : Math.min(i, live.length);
  commit(live.slice(0, from) + chars);
  focusAt(from + chars.length);
}
function onInput(i: number, e: Event) {
  const target = e.target as HTMLInputElement;
  const v = live;
  let raw = target.value;
  if (!raw) {
    commit(without(v, i));
    return;
  }
  // typing over a filled box gives two characters: keep the new one, wherever the caret was
  if (v[i] && raw.length === 2) {
    const k = raw.indexOf(v[i]!);
    raw = k >= 0 ? without(raw, k) : raw.charAt(1);
  }
  const chars = clean(raw);
  if (!chars) {
    target.value = live[i] ?? "";
    return;
  }
  if (chars.length === 1 && i < v.length) {
    commit(v.slice(0, i) + chars + v.slice(i + 1));
    focusAt(i + 1);
  } else put(i, chars);
  // a box shows exactly the character the code holds, even when the parent kept the old one
  target.value = live[i] ?? "";
}
function onKey(i: number, e: KeyboardEvent) {
  const v = live;
  const k = e.key;
  if (k === "Backspace") {
    e.preventDefault();
    if (v[i]) {
      commit(without(v, i));
      focusAt(i);
    } else if (i > 0) {
      commit(without(v, i - 1));
      focusAt(i - 1);
    }
  } else if (k === "Delete") {
    e.preventDefault();
    commit(without(v, i));
  } else if (k === "ArrowLeft") {
    e.preventDefault();
    focusAt(i - 1);
  } else if (k === "ArrowRight") {
    e.preventDefault();
    focusAt(Math.min(i + 1, v.length));
  } else if (k === "Home") {
    e.preventDefault();
    focusAt(0);
  } else if (k === "End") {
    e.preventDefault();
    focusAt(v.length);
  }
}
function onFocus(i: number) {
  if (i > live.length) focusAt(live.length);
}
function onPaste(i: number, e: ClipboardEvent) {
  e.preventDefault();
  put(i, e.clipboardData?.getData("text") ?? "");
}

onMounted(() => {
  if (props.autoFocus) focusAt(live.length);
});

defineExpose({
  /** Moves focus to the first empty box. */
  focus: () => focusAt(live.length),
});
</script>

<template>
  <AeField v-bind="attrs.wrapper()" :id="id" :label="label || t('verificationCode')" :hint="hint" :error="error">
    <template #default="field">
      <div role="group" :aria-labelledby="`${field.id}-label`" class="ae-otp" v-bind="attrs.input()">
        <template v-for="i in length" :key="i">
          <span v-if="groupSize && i > 1 && (i - 1) % groupSize === 0" class="ae-otp-sep" aria-hidden="true" />
          <input
            :id="i === 1 ? field.id : undefined"
            :ref="(el) => (refs[i - 1] = el as HTMLInputElement | null)"
            class="ae-input ae-otp-box"
            type="text"
            :inputmode="numeric ? 'numeric' : 'text'"
            :autocomplete="i === 1 ? 'one-time-code' : 'off'"
            autocapitalize="characters"
            :spellcheck="false"
            :value="value[i - 1] || ''"
            :disabled="disabled"
            :data-filled="value[i - 1] ? '' : undefined"
            :aria-label="t(numeric ? 'otpDigit' : 'otpChar', { n: i, total: length })"
            :aria-invalid="field.ariaInvalid"
            :aria-describedby="field.ariaDescribedby"
            @input="onInput(i - 1, $event)"
            @keydown="onKey(i - 1, $event)"
            @focus="onFocus(i - 1)"
            @paste="onPaste(i - 1, $event)"
          />
        </template>
        <input v-if="name" type="hidden" :name="name" :value="value" />
      </div>
    </template>
  </AeField>
</template>

<style>
@layer ae.controls {
  .ae-otp {
    display: flex;
    align-items: center;
    gap: var(--ae-space-2);
    max-width: 100%;
  }

  .ae-otp-sep {
    flex: none;
    width: var(--ae-space-3);
  }

  .ae-otp .ae-otp-box {
    flex: 1 1 0;
    width: 0;
    min-width: 30px;
    max-width: var(--ae-control-height);
    padding: 0;
    text-align: center;
    font: 500 var(--ae-text-xl)/1 var(--ae-font-mono);
    font-variant-numeric: tabular-nums;
    text-transform: uppercase;
    caret-color: var(--ae-primary);
  }

  /* stylelint-disable-next-line selector-not-notation */
  .ae-otp .ae-otp-box[data-filled]:not(:focus):not([aria-invalid="true"]) {
    border-color: var(--ae-ink);
  }
}
</style>
