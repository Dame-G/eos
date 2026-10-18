<script setup lang="ts">
import { computed } from "vue";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** What is progressing. Also the bar's accessible name. */
    label: string;
    /** How far along, from 0 to `max`. */
    value: number;
    /** The value that means finished. */
    max?: number;
    /** Text shown at the end of the row. Defaults to a percentage. */
    valueText?: string;
  }>(),
  { max: 100 },
);

const percent = computed(() => Math.max(0, Math.min(100, (props.value / (props.max || 100)) * 100)));
</script>

<template>
  <div class="ae-progress">
    <div class="ae-progress-head">
      <span class="ae-progress-label">{{ label }}</span>
      <span class="ae-progress-value">{{ valueText || Math.round(percent) + "%" }}</span>
    </div>
    <div
      class="ae-progress-track"
      role="progressbar"
      :aria-label="label"
      aria-valuemin="0"
      :aria-valuemax="max || 100"
      :aria-valuenow="value"
    >
      <div class="ae-progress-fill" :style="{ width: percent + '%' }"></div>
    </div>
  </div>
</template>

<style>
@layer ae.primitives {
  .ae-progress {
    display: grid;
    gap: var(--ae-space-2);
  }

  .ae-progress-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--ae-space-3);
  }

  .ae-progress-label {
    font: 500 var(--ae-text-md) / 1.3 var(--ae-font-sans);
  }

  .ae-progress-value {
    font: 500 var(--ae-text-sm) / 1.3 var(--ae-font-mono);
    font-variant-numeric: tabular-nums;
    color: var(--ae-muted);
  }

  .ae-progress-track {
    height: 10px;
    border-radius: var(--ae-radius-pill);
    background: var(--ae-surface-tint);
    box-shadow: inset 0 0 0 1px var(--ae-border-strong);
    overflow: hidden;
  }

  .ae-progress-fill {
    height: 100%;
    border-radius: var(--ae-radius-pill);
    background: var(--ae-primary);
    box-shadow: inset 0 0 0 1px var(--ae-primary);
    transition: width var(--ae-duration-move) var(--ae-easing-out);
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-progress-fill {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .ae-progress-fill {
      forced-color-adjust: none;
      background: Highlight;
    }
  }
}
</style>
