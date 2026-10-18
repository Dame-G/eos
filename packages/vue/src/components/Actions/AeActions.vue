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
  <component :is="as" class="ae-actions" :class="bar && 'ae-actions--bar'">
    <slot />
  </component>
</template>

<style>
@layer ae.blocks {
  .ae-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ae-space-2);
  }

  .ae-actions--bar {
    padding: var(--ae-space-3) var(--ae-space-4);
    border-top: var(--ae-stroke-hair) solid var(--ae-border);
    background: var(--ae-surface-tint);
  }

  @media (max-width: 32rem) {
    .ae-actions--bar > .ae-btn {
      flex: 1 1 100%;
    }
  }

  @media print {
    .ae-actions {
      display: none;
    }
  }
}
</style>
