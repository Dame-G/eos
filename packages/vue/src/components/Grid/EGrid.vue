<script setup lang="ts">
import { computed } from "vue";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The element to render, for example `ul` with `li` children. */
    as?: string;
    /** The narrowest a column may be, as a CSS length. One column below that. */
    min?: string;
    /** A space token number (1, 2, 3, 4, 6, 8), or any CSS length as a string. */
    gap?: number | string;
    /** Packs cards of uneven height into columns with no gaps under the short ones. Items flow top to bottom within each column. */
    masonry?: boolean;
  }>(),
  { as: "div", min: "16rem", gap: 4, masonry: false },
);

defineSlots<{
  /** The cards. Items stretch to the tallest in their row, unless `masonry` is set. */
  default(): unknown;
}>();

const gapValue = computed(() => (typeof props.gap === "number" ? `var(--e-space-${props.gap})` : props.gap));
</script>

<template>
  <component :is="as" :class="['e-grid-layout', { 'e-grid-layout--masonry': masonry }]" :style="{ '--e-gap': gapValue, '--e-min': min }">
    <slot />
  </component>
</template>

<style>
@layer e.blocks {
  .e-grid-layout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--e-min, 16rem)), 1fr));
    gap: var(--e-gap, var(--e-space-4));
    align-items: stretch;
  }

  .e-grid-layout > * {
    min-width: 0;
  }

  .e-grid-layout--masonry {
    display: block;
    column-width: var(--e-min, 16rem);
    column-gap: var(--e-gap, var(--e-space-4));
  }

  /* Each item carries the row gap below it, and a column drops the margin after its last item. */
  .e-grid-layout--masonry > * {
    break-inside: avoid;
    margin-block-end: var(--e-gap, var(--e-space-4));
  }
}
</style>
