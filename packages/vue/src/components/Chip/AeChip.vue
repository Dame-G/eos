<script setup lang="ts">
import { computed } from "vue";
import "../../styles/base.css";

export type ChipTone = "neutral" | "ink" | "success" | "info" | "warning" | "danger";

const props = defineProps<{
  /** `success` (paid, confirmed, signed), `info` (due, scheduled, pending), `warning` (needs attention), `danger` (overdue, cancelled, failed). None is neutral. */
  tone?: ChipTone;
}>();

defineSlots<{
  /** The word. Write sentence case; the chip sets it in capitals. */
  default(): unknown;
}>();

const toneClass = computed(() =>
  props.tone && props.tone !== "ink" && props.tone !== "neutral" ? `ae-chip--${props.tone}` : null,
);
</script>

<template>
  <span class="ae-chip" :class="toneClass"><slot /></span>
</template>

<style>
@layer ae.primitives {
  .ae-chip {
    --ae-chip-text: var(--ae-ink);
    --ae-chip-soft: var(--ae-surface-tint);

    display: inline-flex;
    align-items: center;
    gap: var(--ae-space-1);
    height: var(--ae-chip-height);
    padding: 0 var(--ae-space-3);
    border-radius: var(--ae-radius-pill);
    background: var(--ae-chip-soft);
    color: var(--ae-chip-text);
    box-shadow: inset 0 0 0 1px var(--ae-chip-text);
    font: 600 var(--ae-text-xs) / 1 var(--ae-font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
    /* stylelint-disable declaration-block-no-redundant-longhand-properties -- kept as two longhands, as in the reference */
    align-self: flex-start;
    justify-self: start;
    /* stylelint-enable declaration-block-no-redundant-longhand-properties */
  }

  .ae-chip--success {
    --ae-chip-text: var(--ae-secondary);
    --ae-chip-soft: var(--ae-secondary-soft);
  }

  .ae-chip--info {
    --ae-chip-text: var(--ae-primary);
    --ae-chip-soft: var(--ae-surface-tint);
  }

  .ae-chip--danger {
    --ae-chip-text: var(--ae-danger);
    --ae-chip-soft: var(--ae-danger-soft);
  }

  .ae-chip--warning {
    --ae-chip-text: var(--ae-warning-strong);
    --ae-chip-soft: var(--ae-warning-soft);
  }

  @media (forced-colors: active) {
    .ae-chip {
      border: 1px solid CanvasText;
    }
  }

  @media print {
    .ae-chip {
      border: 1px solid #000;
      background: none;
      color: #000;
    }
  }
}
</style>
