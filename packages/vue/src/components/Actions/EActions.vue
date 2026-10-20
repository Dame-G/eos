<script setup lang="ts">
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** The element to render. Use `footer` for a bar at the end of a card. */
    as?: string;
    /** Puts the group on a tinted footer bar with a rule above, for actions that end a card or an overlay. Buttons stack full width up to 32rem. Leave it off for the next step on a page. */
    bar?: boolean;
    /** Names the group for screen readers (for example "Record actions"): renders `role="group"` with `aria-label`. Use it for buttons that belong together, such as a filter row. */
    label?: string;
  }>(),
  { as: "div" },
);

defineSlots<{
  /** The Buttons, in the order of the content, the main action first. */
  default(): unknown;
}>();
</script>

<template>
  <component
    :is="as"
    class="e-actions"
    :class="bar && 'e-actions--bar'"
    :role="label ? 'group' : undefined"
    :aria-label="label"
  >
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
