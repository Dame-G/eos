<script setup lang="ts">
import "../../styles/base.css";

defineProps<{
  /** The smaller size, for a hint inside running small text. */
  small?: boolean;
}>();

defineSlots<{
  /** The key, written as it is on the keycap: "/", "Esc", "Ctrl". */
  default(): unknown;
}>();
</script>

<template>
  <kbd class="e-kbd" :class="small && 'e-kbd--s'"><slot /></kbd>
</template>

<style>
@layer e.primitives {
  .e-kbd {
    display: inline-block;
    min-width: 1.5em;
    padding: 0 var(--e-space-1);
    border: 0;
    border-radius: var(--e-radius-sm);
    background: var(--e-surface-tint);
    box-shadow: inset 0 0 0 var(--e-stroke-hair) var(--e-border-strong);
    color: var(--e-muted);
    font: 500 var(--e-text-sm) / 1.5 var(--e-font-mono);
    text-align: center;
    white-space: nowrap;
  }

  .e-kbd--s {
    font-size: var(--e-text-xs);
  }

  @media (forced-colors: active) {
    .e-kbd {
      outline: var(--e-stroke-hair) solid ButtonText;
      outline-offset: calc(-1 * var(--e-stroke-hair));
    }
  }
}
</style>
