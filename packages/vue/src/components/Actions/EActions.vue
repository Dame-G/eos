<script setup lang="ts">
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** The element to render, `div` by default. Use `footer` for a bar at the end of a card. */
    as?: string;
    /** Puts the group on a tinted footer bar with a rule above. Use it for a group that ends a card or an overlay. */
    bar?: boolean;
  }>(),
  { as: "div" },
);

defineSlots<{
  /** The Buttons, in the order of the content, the main action first. */
  default(): unknown;
}>();
</script>

<template>
  <component :is="as" class="e-actions" :class="bar && 'e-actions--bar'">
    <slot />
  </component>
</template>

<style>
@layer e.blocks {
  .e-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--e-space-2);
  }

  .e-actions--bar {
    padding: var(--e-space-3) var(--e-space-4);
    border-top: var(--e-stroke-hair) solid var(--e-border);
    background: var(--e-surface-tint);
  }

  @media (max-width: 32rem) {
    .e-actions--bar > .e-btn {
      flex: 1 1 100%;
    }
  }

  @media print {
    .e-actions {
      display: none;
    }
  }
}
</style>
