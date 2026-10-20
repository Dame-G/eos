<script setup lang="ts">
import { computed } from "vue";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The element to render, such as `ul` (with `li` children). */
    as?: string;
    /** A space token number (1, 2, 3, 4, 6, 8) becomes `var(--e-space-N)`; a string is used as given, so any CSS length works. */
    gap?: number | string;
    /** Aligns the children across the column: `center` or `end`. Stretched by default. */
    align?: "center" | "end";
  }>(),
  { as: "div", gap: 4 },
);

defineSlots<{
  /** The children, one under another. */
  default(): unknown;
}>();

const gapValue = computed(() => (typeof props.gap === "number" ? `var(--e-space-${props.gap})` : props.gap));
</script>

<template>
  <component :is="as" class="e-stack" :class="align && `e-stack--${align}`" :style="{ '--e-gap': gapValue }">
    <slot />
  </component>
</template>

<style>
@layer e.blocks {
  .e-stack {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-content: start;
    gap: var(--e-gap, var(--e-space-3));
    min-width: 0;
  }

  .e-stack--center {
    justify-items: center;
  }

  .e-stack--end {
    justify-items: end;
  }
}
</style>
