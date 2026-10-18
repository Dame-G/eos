<script setup lang="ts">
import { computed } from "vue";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The element to render, `div` by default. */
    as?: string;
    /** A space token number (1, 2, 3, 4, 6, 8), or any CSS length as a string. */
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

const gapValue = computed(() => (typeof props.gap === "number" ? `var(--ae-space-${props.gap})` : props.gap));
</script>

<template>
  <component :is="as" class="ae-stack" :class="align && `ae-stack--${align}`" :style="{ '--ae-gap': gapValue }">
    <slot />
  </component>
</template>

<style>
@layer ae.blocks {
  .ae-stack {
    display: grid;
    align-content: start;
    gap: var(--ae-gap, var(--ae-space-3));
    min-width: 0;
  }

  .ae-stack--center {
    justify-items: center;
  }

  .ae-stack--end {
    justify-items: end;
  }
}
</style>
