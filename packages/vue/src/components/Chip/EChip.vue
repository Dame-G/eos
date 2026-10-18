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
  props.tone && props.tone !== "ink" && props.tone !== "neutral" ? `e-chip--${props.tone}` : null,
);
</script>

<template>
  <span class="e-chip" :class="toneClass"><slot /></span>
</template>

<style>
@layer e.primitives {
  .e-chip {
    --e-chip-text: var(--e-ink);
    --e-chip-soft: var(--e-surface-tint);

    display: inline-flex;
    align-items: center;
    gap: var(--e-space-1);
    height: var(--e-chip-height);
    padding: 0 var(--e-space-3);
    border-radius: var(--e-radius-pill);
    background: var(--e-chip-soft);
    color: var(--e-chip-text);
    box-shadow: inset 0 0 0 1px var(--e-chip-text);
    font: 600 var(--e-text-xs) / 1 var(--e-font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
    /* stylelint-disable declaration-block-no-redundant-longhand-properties -- kept as two longhands, as in the reference */
    align-self: flex-start;
    justify-self: start;
    /* stylelint-enable declaration-block-no-redundant-longhand-properties */
  }

  .e-chip--success {
    --e-chip-text: var(--e-secondary);
    --e-chip-soft: var(--e-secondary-soft);
  }

  .e-chip--info {
    --e-chip-text: var(--e-primary);
    --e-chip-soft: var(--e-surface-tint);
  }

  .e-chip--danger {
    --e-chip-text: var(--e-danger);
    --e-chip-soft: var(--e-danger-soft);
  }

  .e-chip--warning {
    --e-chip-text: var(--e-warning-strong);
    --e-chip-soft: var(--e-warning-soft);
  }

  @media (forced-colors: active) {
    .e-chip {
      border: 1px solid CanvasText;
    }
  }

  @media print {
    .e-chip {
      border: 1px solid #000;
      background: none;
      color: #000;
    }
  }
}
</style>
