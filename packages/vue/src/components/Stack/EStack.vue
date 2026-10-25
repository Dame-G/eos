<script setup lang="ts">
import { computed } from "vue";
import { useGap, type GapToken } from "./gap.js";
import { useListRole } from "./list.js";
import type { ElementTag } from "../../types.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The element to render, such as `ul` (with `li` children). `ul` and `ol` lose their bullets and padding. */
    as?: ElementTag;
    /** `tight`, `snug`, `base`, `loose` or `section` (the gap tokens), or a space token number (1 to 6, 8, 10, 12 or 16) for `var(--e-space-N)`. A string is used as given, so any CSS length works. */
    gap?: GapToken | string;
    /** Aligns the children across the column. Stretched when left out. `baseline` only lines up children that `wrapBelow` lays side by side; in a column it is `start`. */
    align?: "start" | "center" | "end" | "stretch" | "baseline";
    /** Places the children down the column when the stack is taller than they are. Left out, they sit at the start. */
    justify?: "start" | "center" | "end" | "between";
    /** Draws a hairline between the children, centred in the gap. Not used with `wrapBelow`. */
    divider?: boolean;
    /** A CSS length. Lays the children side by side, each as wide as the stack allows, and stacks them into one column once the stack is narrower than this. Left out, the children always stack. */
    wrapBelow?: string;
  }>(),
  { as: "div", gap: "base" },
);

defineSlots<{
  /** The children, one under another. */
  default(): unknown;
}>();

const gapCss = useGap(() => props.gap);
const style = computed(() => ({
  "--_gap": gapCss.value,
  "--_a": props.align,
  "--_j": props.justify === "between" ? "space-between" : props.justify,
  "--_below": props.wrapBelow,
}));
const listRole = useListRole(() => props.as);
</script>

<template>
  <!-- A list with its bullets removed loses its role in Safari, so it is given back. -->
  <component
    :is="as"
    class="e-stack"
    :class="[wrapBelow ? 'e-stack--wrap' : divider && 'e-stack--divider']"
    :role="listRole"
    :style="style"
  >
    <slot />
  </component>
</template>

<style>
@layer e.blocks {
  .e-stack {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-content: var(--_j, start);
    justify-items: var(--_a, stretch);
    gap: var(--_gap, var(--e-gap-base));
    min-width: 0;
  }

  .e-stack:is(ul, ol) {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* A basis wider than the container (a negative one below it, clamped to 0) puts one child on each line. */
  .e-stack--wrap {
    display: flex;
    flex-wrap: wrap;
    align-items: var(--_a, stretch);
  }

  .e-stack--wrap > * {
    flex: 1 1 calc((var(--_below) - 100%) * 999);
    min-width: 0;
  }

  .e-stack--divider > * + * {
    padding-block-start: var(--_gap, var(--e-gap-base));
    border-block-start: var(--e-stroke-hair) solid var(--e-border);
  }
}
</style>
