<script setup lang="ts">
import { computed, ref, watch } from "vue";
import AeIcon from "../Icon/AeIcon.vue";
import AeField from "../Field/AeField.vue";
import { useMessages } from "../../config.js";
import { focusInside } from "../../composables/focusInside.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import "../../styles/base.css";
import "../TextField/input.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** The visible label, a mono kicker above the field. */
  label: string;
  /** Keep the label for screen readers and remove it from the page. */
  hideLabel?: boolean;
  /** The lowest value. The value clamps to it and the decrease button disables there. */
  min?: number;
  /** The highest value. The value clamps to it and the increase button disables there. */
  max?: number;
  /** How far a button or arrow key moves the value. Decimals shown follow the step. */
  step?: number;
  /** A unit before the value. */
  prefix?: string;
  /** A unit after the value, such as visits. */
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

/** The number, or `null` when the field is empty. */
const model = defineModel<number | null>({ default: null });

const t = useMessages();
const attrs = useFieldAttrs();
const input = ref<HTMLInputElement | null>(null);

const stepBy = computed(() => props.step || 1);
const decimals = computed(() => (String(stepBy.value).split(".")[1] || "").length);
const format = (n: number | null | undefined) => (n == null ? "" : Number(n).toFixed(decimals.value));
const text = ref(format(model.value));
watch(model, (v) => (text.value = format(v)));

const num = computed(() => (model.value == null ? undefined : Number(model.value)));

function clamp(n: number): number {
  if (props.min != null && n < props.min) n = props.min;
  if (props.max != null && n > props.max) n = props.max;
  return n;
}
function set(n: number) {
  n = clamp(n);
  model.value = n;
  text.value = n.toFixed(decimals.value);
}
function bump(dir: 1 | -1, mult = 1) {
  const base = num.value == null ? (props.min != null ? props.min - stepBy.value * (dir > 0 ? 1 : 0) : 0) : num.value;
  set(Math.round((base + dir * stepBy.value * mult) * 1e6) / 1e6);
}
function commit() {
  const n = parseFloat(text.value.replace(/,/g, ""));
  if (isNaN(n)) {
    if (text.value === "") model.value = null;
    else text.value = format(model.value);
  } else set(n);
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === "ArrowUp") {
    e.preventDefault();
    bump(1, e.shiftKey ? 10 : 1);
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    bump(-1, e.shiftKey ? 10 : 1);
  } else if (e.key === "Enter") commit();
}

/** The input's own attributes, with the consumer's fall-through ones last. */
function inputBind(field: { id: string; ariaInvalid: "true" | undefined; ariaDescribedby: string | undefined }) {
  return {
    id: field.id,
    class: ["ae-input", "ae-numinput", !props.prefix && "ae-numfield-first", !props.suffix && "ae-numfield-last"],
    style: { "--ae-chars": Math.max(text.value.length, 4) },
    type: "text" as const,
    inputmode: "decimal" as const,
    role: "spinbutton",
    autocomplete: "off",
    value: text.value,
    disabled: props.disabled,
    required: props.required,
    "aria-valuenow": num.value,
    "aria-valuemin": props.min,
    "aria-valuemax": props.max,
    "aria-invalid": field.ariaInvalid,
    ...attrs.input(field.ariaDescribedby),
  };
}

defineExpose({
  /** The `<input>` element. */
  input,
  /** Puts the cursor in the input. */
  focus: () => input.value?.focus(),
});
</script>

<template>
  <AeField
    v-bind="attrs.wrapper()"
    :id="id"
    :label="label"
    :hide-label="hideLabel"
    :hint="hint"
    :error="error"
    :required="required"
    :optional="optional"
  >
    <template #default="field">
      <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
      <div
        class="ae-input-wrap ae-numfield"
        :class="{ 'ae-numfield--affix': prefix || suffix }"
        :data-invalid="error ? '' : undefined"
        :data-disabled="disabled ? '' : undefined"
        @click="focusInside"
      >
        <button
          type="button"
          class="ae-numbtn"
          :aria-label="t('decrease')"
          :disabled="disabled || (min != null && num != null && num <= min)"
          @click="bump(-1)"
        >
          <AeIcon name="minus" bold />
        </button>
        <span v-if="prefix" class="ae-affix ae-affix--pre ae-numfield-first" aria-hidden="true">{{ prefix }}</span>
        <input
          ref="input"
          v-bind="inputBind(field)"
          @input="text = ($event.target as HTMLInputElement).value"
          @blur="commit"
          @keydown="onKeydown"
        />
        <span v-if="suffix" class="ae-affix ae-affix--post ae-numfield-last" aria-hidden="true">{{ suffix }}</span>
        <button
          type="button"
          class="ae-numbtn"
          :aria-label="t('increase')"
          :disabled="disabled || (max != null && num != null && num >= max)"
          @click="bump(1)"
        >
          <AeIcon name="plus" bold />
        </button>
      </div>
      <input v-if="name" type="hidden" :name="name" :value="num == null ? '' : num" />
    </template>
  </AeField>
</template>

<style>
@layer ae.controls {
  .ae-numfield {
    align-items: stretch;
  }

  .ae-numfield .ae-numinput {
    text-align: center;
    font: 500 var(--ae-text-md)/1 var(--ae-font-mono);
    font-variant-numeric: tabular-nums;
    height: auto;
    padding-inline: var(--ae-space-2);
  }

  .ae-numbtn {
    display: inline-grid;
    place-items: center;
    flex: none;
    width: var(--ae-control-height);
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--ae-ink);
    cursor: pointer;
    transition: background-color var(--ae-duration-tap) var(--ae-easing-out);
  }

  .ae-numbtn:first-child {
    border-inline-end: var(--ae-stroke-hair) solid var(--ae-border-strong);
    border-start-start-radius: var(--ae-radius-md);
    border-end-start-radius: var(--ae-radius-md);
  }

  .ae-numbtn:last-child {
    border-inline-start: var(--ae-stroke-hair) solid var(--ae-border-strong);
    border-start-end-radius: var(--ae-radius-md);
    border-end-end-radius: var(--ae-radius-md);
  }

  .ae-numbtn:hover:not(:disabled) {
    background: var(--ae-wash-hover);
  }

  .ae-numbtn:active:not(:disabled) {
    background: var(--ae-wash-press);
  }

  .ae-numbtn:focus-visible {
    outline: var(--ae-stroke-focus) solid var(--ae-focus-ring);
    outline-offset: -3px;
  }

  .ae-numbtn:disabled {
    color: var(--ae-muted);
    cursor: not-allowed;
    background: transparent;
  }

  .ae-numfield--affix .ae-numinput {
    flex: none;
    width: calc(var(--ae-chars) * 1ch + var(--ae-space-1));
    padding-inline: 0;
    text-align: start;
  }

  .ae-numfield--affix .ae-affix--pre {
    padding-inline: 0 var(--ae-space-1);
  }

  .ae-numfield--affix .ae-affix--post {
    padding-inline: var(--ae-space-1) 0;
  }

  .ae-numfield--affix .ae-numfield-first {
    margin-inline-start: auto;
  }

  .ae-numfield--affix .ae-numfield-last {
    margin-inline-end: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-numbtn {
      transition: none;
    }
  }
}
</style>
