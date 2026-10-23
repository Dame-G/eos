<script setup lang="ts">
import { computed } from "vue";
import { useMessages } from "../../config.js";
import { useLocale } from "../../composables/useLocale.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** What is progressing. Also the bar's accessible name. @default "Progress" with a `value`, "Loading" without */
    label?: string;
    /** How far along, from 0 to `max`. Values outside that range are clamped. Without it the bar is indeterminate and slides back and forth while the length is unknown. */
    value?: number;
    /** The value that means finished. */
    max?: number;
    /** Text shown at the end of the row. @default percent */
    valueText?: string;
  }>(),
  { max: 100 },
);

const t = useMessages();
const loc = useLocale();
const indeterminate = computed(() => props.value === undefined);
const limit = computed(() => props.max || 100);
const clamped = computed(() => Math.max(0, Math.min(limit.value, props.value ?? 0)));
const percent = computed(() => (clamped.value / limit.value) * 100);
const complete = computed(() => !indeterminate.value && percent.value >= 100);
const name = computed(() => props.label || t(indeterminate.value ? "loading" : "progressLabel"));
/** The percentage in the configured locale: "40%", "40 %" in French, "٤٠٪" in Arabic. */
const percentFormat = computed(() => {
  try {
    return new Intl.NumberFormat(loc.locale.value, { style: "percent", maximumFractionDigits: 0 });
  } catch {
    return new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 0 });
  }
});
const percentText = computed(() => percentFormat.value.format(Math.round(percent.value) / 100));
const showHead = computed(() => !!props.label || !indeterminate.value || !!props.valueText);
</script>

<template>
  <div
    class="e-progress"
    :class="[
      indeterminate && 'e-progress--indeterminate',
      !indeterminate && percent === 0 && 'e-progress--empty',
      complete && 'e-progress--complete',
    ]"
  >
    <div v-if="showHead" class="e-progress-head">
      <span class="e-progress-label">{{ name }}</span>
      <span class="e-progress-value">{{ valueText || (indeterminate ? "" : percentText) }}</span>
    </div>
    <div
      class="e-progress-track"
      role="progressbar"
      :aria-label="name"
      aria-valuemin="0"
      :aria-valuemax="indeterminate ? undefined : limit"
      :aria-valuenow="indeterminate ? undefined : clamped"
      :aria-valuetext="valueText || undefined"
      :aria-busy="indeterminate ? 'true' : undefined"
    >
      <div class="e-progress-fill" :style="indeterminate ? undefined : { width: percent + '%' }"></div>
    </div>
  </div>
</template>

<style>
@layer e.primitives {
  .e-progress {
    --_period: calc(var(--e-space-4) * 1.4142);

    /* Which way the sliding bar travels: from the start edge to the end, so it flips in a right-to-left page. */
    --_dir: 1;

    display: grid;
    gap: var(--e-gap-snug);
  }

  .e-progress:dir(rtl) {
    --_dir: -1;
  }

  .e-progress-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--e-gap-base);
  }

  .e-progress-label {
    font: var(--e-weight-medium) var(--e-text-md) / var(--e-leading-snug) var(--e-font-sans);
  }

  .e-progress-value {
    font: var(--e-type-numeral);
    font-variant-numeric: tabular-nums;
    color: var(--e-muted);
  }

  /* No container: the bar is a button face, the primary colour with the button's corner radius, flat. What is left of the track is the same shape in a faint tint of that colour, striped like a busy button, to read as still to do. */
  .e-progress-track {
    position: relative;
    height: var(--e-space-3);
    box-sizing: border-box;
    border-radius: var(--e-radius-md);
    background-color: var(--e-primary-soft);
    background-image: repeating-linear-gradient(
      135deg,
      transparent 0 var(--e-space-2),
      var(--e-wash-hover) var(--e-space-2) var(--e-space-4)
    );
    background-size: var(--_period) var(--_period);
    animation: e-progress-stripes var(--e-duration-spin) var(--e-easing-linear) infinite;
  }

  /* Only the sliding bar leaves the track, so only it needs the track's clip; a bar that stays inside is not clipped on the track's curve. */
  .e-progress--indeterminate .e-progress-track {
    overflow: hidden;
  }

  .e-progress--complete .e-progress-track {
    animation: none;
  }

  .e-progress-fill {
    box-sizing: border-box;
    height: 100%;
    border-radius: var(--e-radius-md);
    background: var(--e-primary);
    transition: width var(--e-duration-move) var(--e-easing-out);
  }

  .e-progress--empty .e-progress-fill {
    visibility: hidden;
  }

  /* Waiting on an unknown length: the bar slides back and forth over the moving stripes. */
  .e-progress--indeterminate .e-progress-fill {
    position: absolute;
    inset-block: 0;
    inset-inline: 0 auto;
    height: auto;
    width: 40%;
    transition: none;
    animation: e-progress-slide var(--e-duration-loop) var(--e-easing-standard) infinite;
  }

  @keyframes e-progress-stripes {
    to {
      background-position-x: var(--_period);
    }
  }

  @keyframes e-progress-slide {
    from {
      transform: translateX(calc(-100% * var(--_dir)));
    }

    to {
      transform: translateX(calc(250% * var(--_dir)));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .e-progress-track {
      animation: none;
    }

    .e-progress--indeterminate .e-progress-fill {
      width: 100%;
      animation: none;
      border-radius: 0;
      background: repeating-linear-gradient(
        135deg,
        var(--e-primary) 0 var(--e-space-2),
        transparent var(--e-space-2) var(--e-space-4)
      );
    }
  }

  @media (forced-colors: active) {
    .e-progress-track {
      border: var(--e-stroke-edge) solid CanvasText;
    }

    .e-progress-fill,
    .e-progress--indeterminate .e-progress-fill {
      forced-color-adjust: none;
      background: Highlight;
    }
  }
}
</style>
