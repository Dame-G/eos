<script setup lang="ts">
import { computed, ref } from "vue";
import { ConfigProvider, SliderRoot, SliderThumb, SliderTrack } from "reka-ui";
import EField from "../Field/EField.vue";
import type { EFieldCommonProps } from "../Field/fieldProps.js";
import { useMessages } from "../../config.js";
import { useDir } from "../../composables/useDir.js";
import { useFieldControl } from "../../composables/useFieldControl.js";
import "../../styles/base.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    Omit<EFieldCommonProps, "required"> & {
      /** Shows "Required" beside the label. A slider always has a value, so nothing is checked and no attribute is set. */
      required?: boolean;
      /** What the slider sets. Names every thumb. */
      label: string;
      /** The lowest value. */
      min?: number;
      /** The highest value. */
      max?: number;
      /** The distance between values. Keys and dragging land on multiples of it from `min`. */
      step?: number;
      /** Two thumbs choose a span. `v-model` is then `[from, to]` in place of a number. */
      range?: boolean;
      /** Draws tick marks: `true` for every step (at most about a hundred, so a fine step marks every few), or the values to mark. */
      marks?: boolean | number[];
      /** Turns a value into the words screen readers announce (`aria-valuetext`), such as "$40". Without it the number is read. */
      valueText?: (value: number) => string;
      /** The name submitted with a form. A range posts two entries, `from` first. Posts nothing while disabled. */
      name?: string;
    }
  >(),
  { min: 0, max: 100, step: 1 },
);

/** The value, or `[from, to]` with `range`. Left unset, a single slider sits at `min` and a range spans `min` to `max`. */
const model = defineModel<number | [number, number]>();

const t = useMessages();
const dir = useDir();
const control = useFieldControl(props);

const values = computed<number[]>(() => {
  const v = model.value;
  if (props.range) return Array.isArray(v) ? [v[0], v[1]] : [props.min, props.max];
  return [Array.isArray(v) ? v[0] : (v ?? props.min)];
});

function update(next: number[] | undefined) {
  if (props.readonly || props.disabled || !next) return;
  model.value = props.range ? [next[0]!, next[1]!] : next[0]!;
}

/**
 * The thumb is focused in code when it is pressed, and the browser then guesses whether to draw the focus ring from the
 * last interaction: on a fresh page it guesses a keyboard and draws it. The ring is for the keyboard, so a press hides it
 * until the next key.
 */
const byPointer = ref(false);

/** A read-only slider takes focus but swallows the pointer and the keys that would move a thumb. */
function hold(e: Event) {
  if (props.readonly && !(e instanceof KeyboardEvent && e.key === "Tab")) e.stopImmediatePropagation();
}

/** The most tick marks drawn for `marks: true`. A finer step marks every few steps, so the marks spread over the whole track. */
const MAX_TICKS = 100;
const ticks = computed<number[]>(() => {
  if (!props.marks) return [];
  if (Array.isArray(props.marks)) return props.marks;
  // Counted, not summed: adding 0.1 again and again drifts past `max` and drops the last tick.
  const steps = Math.floor((props.max - props.min) / props.step + 1e-9);
  const stride = Math.max(1, Math.ceil(steps / MAX_TICKS));
  const at = (k: number) => Math.round((props.min + k * props.step) * 1e9) / 1e9;
  const out: number[] = [];
  for (let k = 0; k <= steps; k += stride) out.push(at(k));
  if (steps % stride) out.push(at(steps));
  return out;
});
/**
 * Where the middle of a thumb sits for a value. A thumb stays inside the track, so its middle runs from half a thumb in
 * to half a thumb short of the end, not from edge to edge: the marks and the filled range use the same line.
 */
const at = (v: number) => {
  const f = (v - props.min) / (props.max - props.min);
  return `calc(var(--_half) - var(--e-stroke-edge) + (100% + 2 * var(--e-stroke-edge) - var(--_thumb)) * ${f})`;
};
const filled = computed(() => ({
  insetInlineStart: values.value.length > 1 ? at(values.value[0]!) : "0",
  insetInlineEnd: `calc(100% - ${at(values.value[values.value.length - 1]!)})`,
}));

/** The label points at the first thumb, which is no form control, so a click on it moves focus there by hand. */
function onFieldClick(e: MouseEvent) {
  if (!(e.target as Element).closest(".e-field-label")) return;
  const thumb = (e.currentTarget as Element).querySelector<HTMLElement>(".e-slider-thumb");
  if (thumb && !props.disabled) thumb.focus();
}

/** The thumbs of a range are told apart by name: "Price minimum", "Price maximum". */
const thumbLabel = (i: number) => (props.range ? t(i === 0 ? "minOf" : "maxOf", { col: props.label }) : undefined);
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
    @click="onFieldClick"
  >
    <template #default="field">
      <ConfigProvider :dir="dir">
        <SliderRoot
          :model-value="values"
          :min="min"
          :max="max"
          :step="step"
          :dir="dir"
          :disabled="disabled"
          class="e-slider"
          :class="{ 'e-slider--readonly': readonly, 'e-slider--pointer': byPointer }"
          @update:model-value="update"
          @pointerdown.capture="
            byPointer = true;
            hold($event);
          "
          @keydown.capture="
            byPointer = false;
            hold($event);
          "
        >
          <SliderTrack class="e-slider-track">
            <span class="e-slider-range" :style="filled" />
            <span v-if="ticks.length" class="e-slider-marks" aria-hidden="true">
              <span v-for="tick in ticks" :key="tick" class="e-slider-mark" :style="{ insetInlineStart: at(tick) }" />
            </span>
          </SliderTrack>
          <SliderThumb
            v-for="(value, i) in values"
            :key="i"
            class="e-slider-thumb"
            v-bind="{
              ...control.attrs.input(field.ariaDescribedby),
              id: i === 0 ? field.id : undefined,
              'aria-label': thumbLabel(i),
              'aria-labelledby': range ? undefined : `${field.id}-label`,
              'aria-valuetext': valueText ? valueText(value) : undefined,
              'aria-invalid': field.ariaInvalid,
              'aria-readonly': readonly ? 'true' : undefined,
            }"
          />
        </SliderRoot>
      </ConfigProvider>
      <input
        v-for="(value, i) in name ? values : []"
        :key="`h${i}`"
        type="hidden"
        v-bind="control.hidden(name, value)"
      />
    </template>
  </EField>
</template>

<style>
@layer e.controls {
  /* The hit area is the tap height; the groove is a pressed-in track, as on the segmented control, with the chosen span filled in the primary colour. */
  .e-slider {
    --_groove: var(--e-gap-snug);
    --_thumb: var(--e-check-size);
    --_half: calc(var(--_thumb) / 2);

    position: relative;
    display: flex;
    align-items: center;
    height: var(--e-control-height);
    user-select: none;
    touch-action: none;
  }

  .e-slider-track {
    position: relative;
    flex: 1;
    height: var(--_groove);
    border: var(--e-stroke-edge) solid var(--e-border-strong);
    border-radius: var(--e-radius-sm);
    background: var(--e-surface-tint);
    background-clip: padding-box;
    box-shadow: var(--e-well);
  }

  .e-slider-range {
    position: absolute;
    height: 100%;

    /* Fills the track's padding edge, so it takes the track's inner radius, not the outer one. */
    border-radius: max(0px, calc(var(--e-radius-sm) - var(--e-stroke-edge)));
    background: var(--e-primary);
  }

  .e-slider-marks {
    position: absolute;
    inset-inline: 0;
    inset-block-start: calc(100% + var(--e-gap-tight));
  }

  .e-slider-mark {
    position: absolute;
    margin-inline-start: calc(var(--e-stroke-edge) / -2);
    width: var(--e-stroke-edge);
    height: var(--e-gap-tight);
    background: var(--e-border-strong);
  }

  /* The thumb is a small button face with a slab under it. Its face is the page surface, so it stands out on the groove in every theme, and it stands on a primary slab that sinks when pressed. The slab makes the bottom border thicker, so the bottom corners take taller vertical radii to stay round rather than elliptical. */
  .e-slider-thumb {
    --_slab: var(--e-primary-slab);
    --_lift: var(--e-depth);

    display: block;
    box-sizing: border-box;
    width: var(--_thumb);
    height: var(--_thumb);
    border: var(--e-stroke-edge) solid var(--_slab);
    border-bottom-width: calc(var(--e-stroke-edge) + var(--_lift));
    border-radius: var(--e-radius-sm) / var(--e-radius-sm) var(--e-radius-sm) calc(var(--e-radius-sm) + var(--_lift))
      calc(var(--e-radius-sm) + var(--_lift));
    background: var(--e-surface);
    background-clip: padding-box;
    cursor: grab;
    transition: var(--e-transition-state);
  }

  .e-slider-thumb:active {
    --_lift: 0px;

    cursor: grabbing;
  }

  .e-slider-thumb:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-stroke-focus);
  }

  .e-slider--pointer .e-slider-thumb:focus-visible {
    outline: none;
  }

  .e-slider-thumb[aria-invalid="true"] {
    --_slab: var(--e-danger);
  }

  /* Read-only keeps the value in view but is not something to operate: as in a read-only field the well is gone, and the thumb is a flat marker, not a raised button. */
  .e-slider--readonly .e-slider-track {
    background: var(--e-surface-tint);
    box-shadow: none;
  }

  .e-slider--readonly .e-slider-thumb {
    --_lift: 0px;

    cursor: default;
  }

  .e-slider--readonly .e-slider-thumb:not([aria-invalid="true"]) {
    --_slab: var(--e-border-strong);
  }

  .e-slider[data-disabled] {
    cursor: not-allowed;
  }

  .e-slider[data-disabled] .e-slider-track {
    outline: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    border-color: transparent;
    background: var(--e-disabled-fill);
    box-shadow: none;
  }

  .e-slider[data-disabled] .e-slider-range {
    background: var(--e-disabled-ink);
  }

  .e-slider-thumb[data-disabled] {
    --_lift: 0px;

    outline: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    border-color: transparent;

    /* The disabled fill is clear, so the thumb needs a face of its own or the range would show through it. */
    background-color: var(--e-surface);
    background-image: linear-gradient(var(--e-disabled-fill), var(--e-disabled-fill));
    cursor: not-allowed;
  }

  @media (forced-colors: active) {
    .e-slider-range {
      forced-color-adjust: none;
      background: Highlight;
    }
  }
}
</style>
