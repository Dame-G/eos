<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import EIcon from "../Icon/EIcon.vue";
import EField from "../Field/EField.vue";
import EInputShell from "../Field/EInputShell.vue";
import type { EFieldCommonProps, EFieldBoxProps } from "../Field/fieldProps.js";
import { useMessages } from "../../config.js";
import { useLocale } from "../../composables/useLocale.js";
import { useFieldControl, type FieldSlot } from "../../composables/useFieldControl.js";
import "../../styles/base.css";
import "../../styles/controls/input.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  EFieldCommonProps &
    Pick<EFieldBoxProps, "size"> & {
      /** The visible label above the field. */
      label: string;
      /** The lowest value. The value clamps to it and the decrease button dims there. */
      min?: number;
      /** The highest value. The value clamps to it and the increase button dims there. */
      max?: number;
      /** The amount one step of the buttons and arrow keys changes the value. Decimals shown follow the step (`0.25` shows two). @default 1 */
      step?: number;
      /** A unit before the value. Read with the value by screen readers. */
      prefix?: string;
      /** A unit after the value, such as visits. Read with the value by screen readers. */
      suffix?: string;
      /** The name submitted with a form (the number, or empty). Posts nothing while disabled. */
      name?: string;
      /** BCP 47 tag the number is written and read in: its decimal and group separators. @default configured locale */
      locale?: string;
    }
>();

/** The number, or `null` when empty. */
const model = defineModel<number | null>({ default: null });

const t = useMessages();
const control = useFieldControl(props);
const loc = useLocale();
const input = control.input;
const hidden = ref<HTMLInputElement | null>(null);
const locale = computed(() => props.locale || loc.locale.value);

/** Press and hold on a button: the pause before it repeats, and the time between repeats. */
const HOLD_DELAY_MS = 450;
const HOLD_REPEAT_MS = 70;
/** The most decimals a number is shown or kept with. */
const MAX_DECIMALS = 10;

/** How many decimals a number is written with, `1e-7` included. */
function decimalsOf(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const [mantissa = "", exponent] = String(n).toLowerCase().split("e");
  const own = (mantissa.split(".")[1] || "").length;
  return Math.min(MAX_DECIMALS, Math.max(0, own - Number(exponent ?? 0)));
}

const stepBy = computed(() => props.step || 1);
const decimals = computed(() => decimalsOf(stepBy.value));
/** Where the steps are counted from: `min`, or zero. */
const origin = computed(() => props.min ?? 0);
const round = (n: number, places: number) => Number(n.toFixed(Math.min(MAX_DECIMALS, places)));

/** The decimal and group separators of the configured locale. */
const separators = computed(() => {
  try {
    const parts = new Intl.NumberFormat(locale.value).formatToParts(1234567.5);
    return {
      decimal: parts.find((p) => p.type === "decimal")?.value ?? ".",
      group: parts.find((p) => p.type === "group")?.value ?? ",",
    };
  } catch {
    return { decimal: ".", group: "," };
  }
});
/** Shows every decimal the number has, and at least as many as the step. Groups thousands in the configured locale. */
function format(n: number | null | undefined): string {
  if (n == null) return "";
  const digits = Math.max(decimals.value, decimalsOf(n));
  try {
    return new Intl.NumberFormat(locale.value, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(n);
  } catch {
    return n.toFixed(digits);
  }
}
/**
 * Reads typed text with the locale's separators. Spaces and the group separator are dropped. A `.` reads as the
 * decimal point unless the locale uses it for grouping (German, Spanish), where `1.5` means 15.
 */
function parse(raw: string): number {
  const { decimal, group } = separators.value;
  let s = raw.replace(/\s/g, "").replace(/−/g, "-");
  if (group.trim()) s = s.split(group).join("");
  if (decimal !== ".") s = s.replace(decimal, ".");
  return /^-?(\d+\.?\d*|\.\d+)$/.test(s) ? parseFloat(s) : NaN;
}
const text = ref(format(model.value));
// A number that came from the text being typed must not rewrite that text (typing "1." must stay "1.").
watch([model, separators], () => {
  if (model.value != null && parse(text.value) === model.value) return;
  if (model.value == null && text.value === "") return;
  text.value = format(model.value);
});

const num = computed(() => (model.value == null ? undefined : Number(model.value)));

function clamp(n: number): number {
  if (props.min != null && n < props.min) n = props.min;
  if (props.max != null && n > props.max) n = props.max;
  return n;
}
/** The posted value is written at once as well: Enter submits the form before Vue has rendered the new model. */
function post(n: number | null) {
  if (hidden.value) hidden.value.value = n == null ? "" : String(n);
}
function set(n: number) {
  n = clamp(n);
  model.value = n;
  text.value = format(n);
  post(n);
}
const atMin = computed(() => props.min != null && num.value != null && num.value <= props.min);
const atMax = computed(() => props.max != null && num.value != null && num.value >= props.max);

/**
 * One step (or `mult` steps) up or down, onto the grid of `min` plus a whole number of steps: a value between two
 * points moves to the next one in that direction. Empty, it starts at `min` going up, or one step under zero going down.
 */
function bump(dir: 1 | -1, mult = 1) {
  if (props.readonly || props.disabled) return;
  const step = stepBy.value;
  const places = Math.max(decimals.value, decimalsOf(origin.value));
  if (num.value == null) {
    set(props.min != null && dir > 0 ? props.min : round(origin.value + dir * step * mult, places));
    return;
  }
  // Counted in steps from the origin, with a little slack so a value already on the grid is not taken as between.
  const at = (num.value - origin.value) / step;
  const near = Math.round(at);
  const k = Math.abs(at - near) < 1e-9 ? near : dir > 0 ? Math.floor(at) : Math.ceil(at);
  set(round(origin.value + (k + dir * mult) * step, places));
}
/** Emits as soon as the text reads as a number, even outside the range, so a form sees what was typed. Blur and Enter clamp it. */
function onInput(e: Event) {
  text.value = (e.target as HTMLInputElement).value;
  if (props.readonly) return;
  if (text.value.trim() === "") {
    model.value = null;
    post(null);
    return;
  }
  const n = parse(text.value);
  if (!isNaN(n)) {
    model.value = n;
    post(n);
  }
}
function commit() {
  if (props.readonly) return;
  const n = parse(text.value);
  if (isNaN(n)) {
    if (text.value === "") {
      model.value = null;
      post(null);
    } else {
      text.value = format(model.value);
      post(model.value);
    }
  } else set(n);
}
function onKeydown(e: KeyboardEvent) {
  if (props.readonly) return;
  if (e.key === "ArrowUp") {
    e.preventDefault();
    bump(1, e.shiftKey ? 10 : 1);
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    bump(-1, e.shiftKey ? 10 : 1);
  } else if (e.key === "PageUp") {
    e.preventDefault();
    bump(1, 10);
  } else if (e.key === "PageDown") {
    e.preventDefault();
    bump(-1, 10);
  } else if (e.key === "Home" && props.min != null) {
    e.preventDefault();
    set(props.min);
  } else if (e.key === "End" && props.max != null) {
    e.preventDefault();
    set(props.max);
  } else if (e.key === "Enter") commit();
}

/** Press and hold on a button repeats the step after a short pause. The click that follows a hold is swallowed. */
let holdDelay: ReturnType<typeof setTimeout> | undefined;
let holdTick: ReturnType<typeof setInterval> | undefined;
let held = false;
function startHold(dir: 1 | -1, e: PointerEvent) {
  if (e.button !== 0 || props.readonly || props.disabled) return;
  held = false;
  stopHold();
  holdDelay = setTimeout(() => {
    held = true;
    holdTick = setInterval(() => bump(dir), HOLD_REPEAT_MS);
  }, HOLD_DELAY_MS);
}
function stopHold() {
  clearTimeout(holdDelay);
  clearInterval(holdTick);
  holdDelay = holdTick = undefined;
  // The click after a hold fires right after pointerup; forget the hold once it has passed.
  if (held) setTimeout(() => (held = false), 0);
}
function press(dir: 1 | -1) {
  if (held) {
    held = false;
    return;
  }
  bump(dir);
}
onBeforeUnmount(stopHold);

function inputBind(field: FieldSlot) {
  return {
    class: ["e-input", "e-numinput", !props.prefix && "e-numfield-first", !props.suffix && "e-numfield-last"],
    style: { "--_chars": Math.max(text.value.length, 1) },
    type: "text" as const,
    inputmode: "decimal" as const,
    role: "spinbutton",
    autocomplete: "off",
    value: text.value,
    "aria-valuenow": num.value,
    "aria-valuetext":
      num.value != null && (props.prefix || props.suffix)
        ? [props.prefix, text.value, props.suffix].filter(Boolean).join(" ")
        : undefined,
    "aria-valuemin": props.min,
    "aria-valuemax": props.max,
    ...control.bind(field),
  };
}

defineExpose(control.exposed);
</script>

<template>
  <EField
    v-bind="control.attrs.wrapper()"
    :id="id"
    :label="label"
    :hide-label="hideLabel"
    :hint="hint"
    :error="error"
    :required="required"
    :optional="optional"
  >
    <template #default="field">
      <EInputShell v-bind="control.shell(error)" class="e-numfield" :class="{ 'e-numfield--affix': prefix || suffix }">
        <button
          type="button"
          class="e-numbtn e-interact e-interact--inset"
          tabindex="-1"
          :aria-label="t('decrease')"
          :disabled="disabled || readonly"
          :aria-disabled="atMin || undefined"
          @pointerdown="startHold(-1, $event)"
          @pointerup="stopHold"
          @pointerleave="stopHold"
          @pointercancel="stopHold"
          @click="press(-1)"
        >
          <EIcon name="minus" bold />
        </button>
        <span v-if="prefix" class="e-affix e-affix--pre e-numfield-first" aria-hidden="true">{{ prefix }}</span>
        <input ref="input" v-bind="inputBind(field)" @input="onInput" @blur="commit" @keydown="onKeydown" />
        <span v-if="suffix" class="e-affix e-affix--post e-numfield-last" aria-hidden="true">{{ suffix }}</span>
        <button
          type="button"
          class="e-numbtn e-interact e-interact--inset"
          tabindex="-1"
          :aria-label="t('increase')"
          :disabled="disabled || readonly"
          :aria-disabled="atMax || undefined"
          @pointerdown="startHold(1, $event)"
          @pointerup="stopHold"
          @pointerleave="stopHold"
          @pointercancel="stopHold"
          @click="press(1)"
        >
          <EIcon name="plus" bold />
        </button>
      </EInputShell>
      <input v-if="name" ref="hidden" type="hidden" v-bind="control.hidden(name, num)" />
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
    font: var(--e-type-button);
    font-family: var(--e-font-mono);
    font-variant-numeric: tabular-nums;
    height: auto;
    padding-inline: var(--e-gap-snug);
  }

  .e-numbtn {
    display: inline-grid;
    place-items: center;
    flex: none;
    width: var(--_h, var(--e-control-height));
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--e-ink);
    cursor: pointer;
  }

  /* The steppers sit flush in the field's border, so their outer corners are its inner radius. */
  .e-numbtn:first-of-type {
    border-inline-end: var(--e-stroke-hair) solid var(--e-border-strong);
    border-start-start-radius: max(0px, calc(var(--e-radius-md) - var(--e-stroke-edge)));
    border-end-start-radius: max(0px, calc(var(--e-radius-md) - var(--e-stroke-edge)));
  }

  .e-numbtn:last-of-type {
    border-inline-start: var(--e-stroke-hair) solid var(--e-border-strong);
    border-start-end-radius: max(0px, calc(var(--e-radius-md) - var(--e-stroke-edge)));
    border-end-end-radius: max(0px, calc(var(--e-radius-md) - var(--e-stroke-edge)));
  }

  .e-numbtn:disabled,
  .e-numbtn[aria-disabled="true"] {
    color: var(--e-disabled-ink);
    cursor: not-allowed;
  }

  .e-numfield--affix .e-numinput {
    flex: none;
    width: calc(var(--_chars) * 1ch);
    padding-inline: 0;
    text-align: start;
  }

  .e-numfield--affix .e-affix--pre {
    padding-inline: 0 var(--e-gap-tight);
  }

  .e-numfield--affix .e-affix--post {
    padding-inline: var(--e-gap-tight) 0;
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

    .e-numfield:not(.e-numfield--affix) .e-numinput {
      text-align: start;
      padding-inline: var(--e-pad-control-sm);
    }
  }

  @container (max-width: 13rem) {
    .e-numfield--affix .e-numbtn {
      display: none;
    }

    .e-numfield--affix .e-numfield-first {
      margin-inline-start: var(--e-pad-control-sm);
    }

    .e-numfield--affix .e-numfield-last {
      margin-inline-end: 0;
    }
  }
}
</style>
