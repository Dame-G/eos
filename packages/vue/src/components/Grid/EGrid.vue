<script setup lang="ts">
import { computed } from "vue";
import "../../styles/base.css";

export type GridGap = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 | 12 | 16;

const props = withDefaults(
  defineProps<{
    /** The element to render, for example `ul` with `li` children. */
    as?: string;
    /** The narrowest a column may be, as a CSS length. One column below that. */
    min?: string;
    /** A space token number (1 to 8, 10, 12 or 16) becomes `var(--e-space-N)`. A string is used as given, so any CSS length works. */
    gap?: GridGap | string;
    /** Aligns each item inside its row. Items stretch to the tallest by default. Not used with `masonry`. */
    align?: "start" | "center" | "end" | "stretch" | "baseline";
    /** Places each item inside its column when it is narrower than the column. Items fill the column by default. Not used with `masonry`. */
    justify?: "start" | "center" | "end" | "stretch";
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
  <component
    :is="as"
    :class="[
      'e-grid-layout',
      masonry && 'e-grid-layout--masonry',
      align && `e-grid-layout--a-${align}`,
      justify && `e-grid-layout--j-${justify}`,
    ]"
    :style="{ '--_gap': gapValue, '--_min': min }"
  >
    <slot />
  </component>
</template>

<style>
@layer e.blocks {
  .e-grid-layout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--_min, 16rem)), 1fr));
    gap: var(--_gap, var(--e-space-4));
    align-items: stretch;
  }

  .e-grid-layout > * {
    min-width: 0;
  }

  .e-grid-layout--a-start {
    align-items: start;
  }

  .e-grid-layout--a-center {
    align-items: center;
  }

  .e-grid-layout--a-end {
    align-items: end;
  }

  .e-grid-layout--a-baseline {
    align-items: baseline;
  }

  .e-grid-layout--j-start {
    justify-items: start;
  }

  .e-grid-layout--j-center {
    justify-items: center;
  }

  .e-grid-layout--j-end {
    justify-items: end;
  }

  .e-grid-layout--masonry {
    display: block;
    column-width: var(--_min, 16rem);
    column-gap: var(--_gap, var(--e-space-4));
  }

  /* Each item carries the row gap below it, and a column drops the margin after its last item. */
  .e-grid-layout--masonry > * {
    break-inside: avoid;
    margin-block-end: var(--_gap, var(--e-space-4));
  }
}
</style>
