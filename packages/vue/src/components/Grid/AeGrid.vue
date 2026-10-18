<script setup lang="ts">
import { computed } from "vue";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The element to render, `div` by default. */
    as?: string;
    /** The narrowest a column may be, as a CSS length. One column below that. */
    min?: string;
    /** A space token number (1, 2, 3, 4, 6, 8), or any CSS length as a string. */
    gap?: number | string;
  }>(),
  { as: "div", min: "16rem", gap: 4 },
);

defineSlots<{
  /** The cards. Items stretch to the tallest in their row. */
  default(): unknown;
}>();

const gapValue = computed(() => (typeof props.gap === "number" ? `var(--ae-space-${props.gap})` : props.gap));
</script>

<template>
  <component :is="as" class="ae-grid-layout" :style="{ '--ae-gap': gapValue, '--ae-min': min }">
    <slot />
  </component>
</template>

<style>
@layer ae.blocks {
  .ae-grid-layout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--ae-min, 16rem)), 1fr));
    gap: var(--ae-gap, var(--ae-space-4));
    align-items: stretch;
  }
}
</style>
