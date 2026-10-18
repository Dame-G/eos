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
  <div class="e-progress">
    <div class="e-progress-head">
      <span class="e-progress-label">{{ label }}</span>
      <span class="e-progress-value">{{ valueText || Math.round(percent) + "%" }}</span>
    </div>
    <div
      class="e-progress-track"
      role="progressbar"
      :aria-label="label"
      aria-valuemin="0"
      :aria-valuemax="max || 100"
      :aria-valuenow="value"
    >
      <div class="e-progress-fill" :style="{ width: percent + '%' }"></div>
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

  .e-progress-track {
    height: 10px;
    border-radius: var(--e-radius-pill);
    background: var(--e-surface-tint);
    box-shadow: inset 0 0 0 1px var(--e-border-strong);
    overflow: hidden;
  }

  .e-progress-fill {
    height: 100%;
    border-radius: var(--e-radius-pill);
    background: var(--e-primary);
    box-shadow: inset 0 0 0 1px var(--e-primary);
    transition: width var(--e-duration-move) var(--e-easing-out);
  }

  @media (prefers-reduced-motion: reduce) {
    .e-progress-fill {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .e-progress-fill {
      forced-color-adjust: none;
      background: Highlight;
    }
  }
}
</style>
