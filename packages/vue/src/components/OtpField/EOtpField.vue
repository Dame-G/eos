<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import EField from "../Field/EField.vue";
import type { EFieldBoxProps, EFieldCommonProps } from "../Field/fieldProps.js";
import { useMessages } from "../../config.js";
import { useFieldControl } from "../../composables/useFieldControl.js";
import { useDir } from "../../composables/useDir.js";
import "../../styles/base.css";
import "../TextField/input.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    EFieldCommonProps &
      Pick<EFieldBoxProps, "size"> & {
        /** The field's label. @default "Verification code" */
        label?: string;
        /** How many characters: the number of boxes. */
        length?: number;
        /** `numeric` opens the number pad and `text` takes letters and digits, upper-cased. */
        inputmode?: "numeric" | "text";
        /** The number of boxes in each group, with a gap between groups. A `length` of 6 with 3 reads 123 456. */
        groupSize?: number;
        /** The name submitted with a form (the whole code), through a hidden input. Posts nothing while disabled. */
        name?: string;
        /** Focuses the first empty box when the field mounts. */
        autoFocus?: boolean;
      }
  >(),
  { length: 6, inputmode: "numeric", groupSize: 0 },
);

const emit = defineEmits<{
  /** Once, when the last box fills. */
  complete: [code: string];
}>();

/** The code typed so far. */
const model = defineModel<string>({ default: "" });

const t = useMessages();
const dir = useDir();
const control = useFieldControl(props);
const attrs = control.attrs;
const numeric = computed(() => props.inputmode !== "text");
const refs: (HTMLInputElement | null)[] = [];

function clean(s: unknown): string {
  const text = String(s ?? "");
  return (numeric.value ? text.replace(/\D/g, "") : text.replace(/[^a-z0-9]/gi, "").toUpperCase()).slice(
    0,
    props.length,
  );
}
const value = computed(() => clean(model.value));

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
  if (props.readonly) return;
  const chars = clean(text);
  if (!chars) return;
  const from = chars.length >= props.length ? 0 : Math.min(i, live.length);
  commit(live.slice(0, from) + chars);
  focusAt(from + chars.length);
}
function onInput(i: number, e: Event) {
  const target = e.target as HTMLInputElement;
  if (props.readonly) {
    target.value = live[i] ?? "";
    return;
  }
  const v = live;
  let raw = target.value;
  if (!raw) {
    commit(without(v, i));
    return;
  }
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
  target.value = live[i] ?? "";
}
function onKey(i: number, e: KeyboardEvent) {
  const v = live;
  const k = e.key;
  if (props.readonly && (k === "Backspace" || k === "Delete")) {
    e.preventDefault();
  } else if (k === "Backspace") {
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
  } else if (k === "ArrowLeft" || k === "ArrowRight") {
    // The boxes run with the text: in a right-to-left page the first box is on the right, so the arrows swap.
    e.preventDefault();
    const back = (k === "ArrowLeft") === (dir.value === "ltr");
    focusAt(back ? i - 1 : Math.min(i + 1, v.length));
  } else if (k === "Home") {
    e.preventDefault();
    focusAt(0);
  } else if (k === "End") {
    e.preventDefault();
    focusAt(v.length);
  }
}
/** The one box in the tab order: the first empty box, or the last when the code is full. Tab leaves the field from it. */
const entry = computed(() => Math.min(value.value.length, props.length - 1));
function onPaste(i: number, e: ClipboardEvent) {
  e.preventDefault();
  put(i, e.clipboardData?.getData("text") ?? "");
}

onMounted(() => {
  if (props.autoFocus) focusAt(live.length);
});

defineExpose({
  /** The first box. */
  get input() {
    return refs[0] ?? null;
  },
  focus: () => focusAt(live.length),
});
</script>

<template>
  <EField
    v-bind="attrs.wrapper()"
    :id="id"
    :label="label || t('verificationCode')"
    :hide-label="hideLabel"
    :hint="hint"
    :error="error"
    :required="required"
    :optional="optional"
  >
    <template #default="field">
      <div role="group" :aria-labelledby="`${field.id}-label`" class="e-otp" v-bind="attrs.group()">
        <template v-for="i in length" :key="i">
          <span v-if="groupSize && i > 1 && (i - 1) % groupSize === 0" class="e-otp-sep" aria-hidden="true" />
          <input
            :id="i === 1 ? field.id : undefined"
            :ref="(el) => (refs[i - 1] = el as HTMLInputElement | null)"
            class="e-input e-otp-box"
            type="text"
            :inputmode="numeric ? 'numeric' : 'text'"
            :autocomplete="i === 1 ? 'one-time-code' : 'off'"
            :autocapitalize="numeric ? undefined : 'characters'"
            :tabindex="i - 1 === entry ? 0 : -1"
            :spellcheck="false"
            :value="value[i - 1] || ''"
            :disabled="disabled"
            :readonly="readonly"
            :required="required"
            :data-size="size && size !== 'md' ? size : undefined"
            :data-filled="value[i - 1] ? '' : undefined"
            :aria-label="t(numeric ? 'otpDigit' : 'otpChar', { n: i, total: length })"
            :aria-invalid="field.ariaInvalid"
            :aria-describedby="field.ariaDescribedby"
            @input="onInput(i - 1, $event)"
            @keydown="onKey(i - 1, $event)"
            @paste="onPaste(i - 1, $event)"
          />
        </template>
        <input v-if="name" type="hidden" v-bind="control.hidden(name, value)" />
      </div>
    </template>
  </EField>
</template>

<style>
@layer e.controls {
  .e-otp {
    display: flex;
    align-items: center;
    gap: var(--e-gap-snug);
    max-width: 100%;
  }

  .e-otp-sep {
    flex: none;
    width: var(--e-gap-base);
  }

  .e-otp .e-otp-box {
    flex: 1 1 0;
    width: 0;
    min-width: var(--e-space-8);
    max-width: var(--_h, var(--e-control-height));
    padding: 0;
    text-align: center;
    font: var(--e-weight-medium) var(--e-text-xl) / var(--e-leading-none) var(--e-font-mono);
    font-variant-numeric: tabular-nums;
    text-transform: uppercase;
    caret-color: var(--e-primary);
  }

  /* stylelint-disable-next-line selector-not-notation */
  .e-otp .e-otp-box[data-filled]:not(:focus):not([aria-invalid="true"]) {
    --e-ring: var(--e-ink);
  }
}
</style>
