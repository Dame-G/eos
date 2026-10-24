<script setup lang="ts">
import { useGap, type GapToken } from "../Stack/gap.js";
import { useListRole } from "../Stack/list.js";
import type { ElementTag } from "../../composables/useSize.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The element to render, such as `ul` with `li` children. `ul` and `ol` lose their bullets and padding and keep their list role. */
    as?: ElementTag;
    /** The narrowest a column may be, as a CSS length. One column below that. */
    min?: string;
    /** `tight`, `snug`, `base`, `loose` or `section` (the gap tokens), or a space token number (1 to 6, 8, 10, 12 or 16) for `var(--e-space-N)`. A string is used as given, so any CSS length works. */
    gap?: GapToken | string;
    /** Aligns each item inside its row. Items stretch to the tallest by default. Not used with `masonry`. */
    align?: "start" | "center" | "end" | "stretch" | "baseline";
    /** Places each item inside its column when it is narrower than the column. Items fill the column by default. Not used with `masonry`. */
    justify?: "start" | "center" | "end" | "stretch";
    /** Packs cards of uneven height into columns with no gaps under the short ones. Items flow top to bottom within each column. */
    masonry?: boolean;
  }>(),
  { as: "div", min: "16rem", gap: "loose", masonry: false },
);

defineSlots<{
  /** The cards. Items stretch to the tallest in their row, unless `masonry` is set. */
  default(): unknown;
}>();

const gapCss = useGap(() => props.gap);
const listRole = useListRole(() => props.as);
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
    :role="listRole"
    :style="{ '--_gap': gapCss, '--_min': min }"
  >
    <slot />
  </component>
</template>

<style>
@layer e.blocks {
  .e-grid-layout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--_min, 16rem)), 1fr));
    gap: var(--_gap, var(--e-gap-loose));
    align-items: stretch;
  }

  .e-grid-layout:is(ul, ol) {
    margin: 0;
    padding: 0;
    list-style: none;
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
    column-gap: var(--_gap, var(--e-gap-loose));
  }

  /* Each item carries the row gap below it, and a column drops the margin after its last item. */
  .e-grid-layout--masonry > * {
    break-inside: avoid;
    margin-block-end: var(--_gap, var(--e-gap-loose));
  }
}
</style>
