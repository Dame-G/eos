<script setup lang="ts">
import { computed } from "vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** What is progressing. Also the bar's accessible name. @default "Loading" */
    label?: string;
    /** How far along, from 0 to `max`; the fill is clamped. Leave it out while the length is unknown: the bar slides back and forth instead (indeterminate). */
    value?: number;
    /** The value that means finished. */
    max?: number;
    /** Text shown at the end of the row. @default percent */
    valueText?: string;
  }>(),
  { max: 100 },
);

const t = useMessages();
const indeterminate = computed(() => props.value === undefined);
const limit = computed(() => props.max || 100);
const clamped = computed(() => Math.max(0, Math.min(limit.value, props.value ?? 0)));
const percent = computed(() => Math.max(0, Math.min(100, ((props.value ?? 0) / (props.max || 100)) * 100)));
const showHead = computed(() => !!props.label || !indeterminate.value || !!props.valueText);
</script>

<template>
  <div
    class="e-progress"
    :class="[indeterminate && 'e-progress--indeterminate', !indeterminate && percent === 0 && 'e-progress--empty']"
  >
    <div v-if="showHead" class="e-progress-head">
      <span class="e-progress-label">{{ label || t("loading") }}</span>
      <span class="e-progress-value">{{ valueText || (indeterminate ? "" : Math.round(percent) + "%") }}</span>
    </div>
    <div
      class="e-progress-track"
      role="progressbar"
      :aria-label="label || t('loading')"
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
    display: grid;
    gap: var(--e-space-2);
  }

  .e-progress-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--e-space-3);
  }

  .e-progress-label {
    font: 500 var(--e-text-md) / 1.3 var(--e-font-sans);
  }

  .e-progress-value {
    font: 500 var(--e-text-sm) / 1.3 var(--e-font-mono);
    font-variant-numeric: tabular-nums;
    color: var(--e-muted);
  }

  /* No container: the bar is a button face, the primary colour with the button's corner radius, flat. What is left of the track is the same shape in a faint tint of that colour, to read as empty. */
  .e-progress-track {
    position: relative;
    height: 12px;
    box-sizing: border-box;
    border-radius: var(--e-radius-md);
    background-color: color-mix(in srgb, var(--e-primary) 30%, var(--e-surface));

    /* The stripes of a busy button run across what is still to do. */
    background-image: repeating-linear-gradient(
      135deg,
      transparent 0 8px,
      color-mix(in srgb, var(--e-primary) 22%, transparent) 8px 16px
    );
    background-size: 22.63px 22.63px;
    animation: e-progress-stripes 0.8s linear infinite;
    overflow: hidden;
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
    inset: 0 auto 0 0;
    height: auto;
    width: 40%;
    transition: none;
    animation: e-progress-slide 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  @keyframes e-progress-stripes {
    to {
      background-position-x: 22.63px;
    }
  }

  @keyframes e-progress-slide {
    from {
      transform: translateX(-100%);
    }

    to {
      transform: translateX(250%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .e-progress-track {
      animation: none;
    }

    .e-progress-fill {
      transition: none;
    }

    .e-progress--indeterminate .e-progress-fill {
      width: 100%;
      animation: none;
      border-radius: 0;
      background: repeating-linear-gradient(
        135deg,
        var(--e-primary) 0 var(--e-space-2),
        transparent var(--e-space-2) calc(2 * var(--e-space-2))
      );
    }
  }

  @media (forced-colors: active) {
    .e-progress-track {
      border: var(--e-stroke-edge) solid CanvasText;
    }

    .e-progress-fill {
      forced-color-adjust: none;
      background: Highlight;
    }

    .e-progress--indeterminate .e-progress-fill {
      background: Highlight;
    }
  }
}
</style>
