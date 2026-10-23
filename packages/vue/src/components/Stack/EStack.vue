<script setup lang="ts">
import { computed } from "vue";
import "../../styles/base.css";

export type StackGap = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 | 12 | 16;

const props = withDefaults(
  defineProps<{
    /** The element to render, such as `ul` (with `li` children). */
    as?: string;
    /** A space token number (1 to 8, 10, 12 or 16) becomes `var(--e-space-N)`. A string is used as given, so any CSS length works. */
    gap?: StackGap | string;
    /** Aligns the children across the column. Stretched by default. */
    align?: "start" | "center" | "end" | "stretch" | "baseline";
    /** Places the children down the column when the stack is taller than they are. Left out, they sit at the start. */
    justify?: "start" | "center" | "end" | "between";
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
  <component
    :is="as"
    class="e-stack"
    :class="[align && `e-stack--${align}`, justify && `e-stack--j-${justify}`]"
    :style="{ '--_gap': gapValue }"
  >
    <slot />
  </component>
</template>

<style>
@layer e.blocks {
  .e-stack {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-content: start;
    gap: var(--_gap, var(--e-space-3));
    min-width: 0;
  }

  .e-stack--start {
    justify-items: start;
  }

  .e-stack--center {
    justify-items: center;
  }

  .e-stack--end {
    justify-items: end;
  }

  .e-stack--stretch {
    justify-items: stretch;
  }

  .e-stack--baseline {
    justify-items: baseline;
  }

  .e-stack--j-center {
    align-content: center;
  }

  .e-stack--j-end {
    align-content: end;
  }

  .e-stack--j-between {
    align-content: space-between;
  }
}
</style>
