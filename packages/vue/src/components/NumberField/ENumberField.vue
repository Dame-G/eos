<script setup lang="ts">
import { computed, ref, watch } from "vue";
import EIcon from "../Icon/EIcon.vue";
import EField from "../Field/EField.vue";
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

function inputBind(field: { id: string; ariaInvalid: "true" | undefined; ariaDescribedby: string | undefined }) {
  return {
    id: field.id,
    class: ["e-input", "e-numinput", !props.prefix && "e-numfield-first", !props.suffix && "e-numfield-last"],
    style: { "--e-chars": Math.max(text.value.length, 1) },
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
  input,
  focus: () => input.value?.focus(),
});
</script>

<template>
  <EField
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
        class="e-input-wrap e-numfield"
        :class="{ 'e-numfield--affix': prefix || suffix }"
        :data-invalid="error ? '' : undefined"
        :data-disabled="disabled ? '' : undefined"
        @click="focusInside"
      >
        <button
          type="button"
          class="e-numbtn"
          :aria-label="t('decrease')"
          :disabled="disabled || (min != null && num != null && num <= min)"
          @click="bump(-1)"
        >
          <EIcon name="minus" bold />
        </button>
        <span v-if="prefix" class="e-affix e-affix--pre e-numfield-first" aria-hidden="true">{{ prefix }}</span>
        <input
          ref="input"
          v-bind="inputBind(field)"
          @input="text = ($event.target as HTMLInputElement).value"
          @blur="commit"
          @keydown="onKeydown"
        />
        <span v-if="suffix" class="e-affix e-affix--post e-numfield-last" aria-hidden="true">{{ suffix }}</span>
        <button
          type="button"
          class="e-numbtn"
          :aria-label="t('increase')"
          :disabled="disabled || (max != null && num != null && num >= max)"
          @click="bump(1)"
        >
          <EIcon name="plus" bold />
        </button>
      </div>
      <input v-if="name" type="hidden" :name="name" :value="num == null ? '' : num" />
    </template>
  </EField>
</template>

<style>
@layer e.controls {
  .e-numfield {
    align-items: stretch;
    container-type: inline-size;
  }

  .e-numfield .e-numinput {
    text-align: center;
    font: 500 var(--e-text-md)/1 var(--e-font-mono);
    font-variant-numeric: tabular-nums;
    height: auto;
    padding-inline: var(--e-space-2);
  }

  .e-numbtn {
    display: inline-grid;
    place-items: center;
    flex: none;
    width: var(--e-control-height);
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--e-ink);
    cursor: pointer;
    transition: background-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-numbtn:first-child {
    border-inline-end: var(--e-stroke-hair) solid var(--e-border-strong);
    border-start-start-radius: var(--e-radius-md);
    border-end-start-radius: var(--e-radius-md);
  }

  .e-numbtn:last-child {
    border-inline-start: var(--e-stroke-hair) solid var(--e-border-strong);
    border-start-end-radius: var(--e-radius-md);
    border-end-end-radius: var(--e-radius-md);
  }

  .e-numbtn:hover:not(:disabled) {
    background: var(--e-wash-hover);
  }

  .e-numbtn:active:not(:disabled) {
    background: var(--e-wash-press);
  }

  .e-numbtn:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: -3px;
  }

  .e-numbtn:disabled {
    color: var(--e-muted);
    cursor: not-allowed;
    background: transparent;
  }

  .e-numfield--affix .e-numinput {
    flex: none;
    width: calc(var(--e-chars) * 1ch);
    padding-inline: 0;
    text-align: start;
  }

  .e-numfield--affix .e-affix--pre {
    padding-inline: 0 var(--e-space-1);
  }

  .e-numfield--affix .e-affix--post {
    padding-inline: var(--e-space-1) 0;
  }

  .e-numfield--affix .e-numfield-first {
    margin-inline-start: auto;
  }

  .e-numfield--affix .e-numfield-last {
    margin-inline-end: auto;
  }

  @container (max-width: 10rem) {
    .e-numbtn {
      display: none;
    }

    .e-numfield .e-numinput {
      text-align: start;
      padding-inline: var(--e-space-3);
    }
  }

  @container (max-width: 13rem) {
    .e-numfield--affix .e-numbtn {
      display: none;
    }

    .e-numfield--affix .e-numfield-first {
      margin-inline-start: var(--e-space-3);
    }

    .e-numfield--affix .e-numfield-last {
      margin-inline-end: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .e-numbtn {
      transition: none;
    }
  }
}
</style>
