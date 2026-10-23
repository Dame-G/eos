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
    EFieldCommonProps & {
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
      /** Draws tick marks: `true` for every step, or the values to mark. */
      marks?: boolean | number[];
      /** Turns a value into the words screen readers announce (`aria-valuetext`), such as "$40". Without it the number is read. */
      format?: (value: number) => string;
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

/** A read-only slider takes focus but swallows the pointer and the keys that would move a thumb. */
/**
 * The thumb is focused in code when it is pressed, and the browser then guesses whether to draw the focus ring from the
 * last interaction: on a fresh page it guesses a keyboard and draws it. The ring is for the keyboard, so a press hides it
 * until the next key.
 */
const byPointer = ref(false);

function hold(e: Event) {
  if (props.readonly && !(e instanceof KeyboardEvent && e.key === "Tab")) e.stopImmediatePropagation();
}

const ticks = computed<number[]>(() => {
  if (!props.marks) return [];
  if (Array.isArray(props.marks)) return props.marks;
  const out: number[] = [];
  for (let v = props.min; v <= props.max && out.length < 101; v += props.step) out.push(v);
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
              'aria-valuetext': format ? format(value) : undefined,
              'aria-invalid': field.ariaInvalid,
              'aria-readonly': readonly ? 'true' : undefined,
              'aria-required': required ? 'true' : undefined,
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

  /* The thumb is a small button face with a slab under it. Like the switch's, its face is `ink`, so it stands out on the groove and on the page in every theme, and it stands on a primary slab that sinks when pressed. */
  .e-slider-thumb {
    --_slab: var(--e-primary-slab);
    --_lift: var(--e-slab);

    display: block;
    box-sizing: border-box;
    width: var(--_thumb);
    height: var(--_thumb);
    border: var(--e-stroke-edge) solid var(--_slab);
    border-bottom-width: calc(var(--e-stroke-edge) + var(--_lift));
    border-radius: var(--e-radius-sm);
    background: var(--e-ink);
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

    background: var(--e-surface);
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
