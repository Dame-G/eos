<script setup lang="ts">
import { computed } from "vue";
import "../../styles/base.css";

export type InlineGap = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 | 12 | 16;

const props = withDefaults(
  defineProps<{
    /** The element to render, for example `ul`. */
    as?: string;
    /** A space token number (1 to 8, 10, 12 or 16) becomes `var(--e-space-N)`. A string is used as given, so any CSS length works. */
    gap?: InlineGap | string;
    /** Main-axis placement. `between` spreads the children apart. Left out, they sit at the start. */
    justify?: "start" | "center" | "end" | "between";
    /** Cross-axis alignment. `start` aligns the top edges and `baseline` aligns the text baselines. Left out, the children are centred. */
    align?: "start" | "center" | "end" | "stretch" | "baseline";
    /** Keeps the children on one line instead of wrapping. */
    nowrap?: boolean;
  }>(),
  { as: "div", gap: 2 },
);

defineSlots<{
  /** The children, in a row that wraps when it runs out of room. */
  default(): unknown;
}>();

const gapValue = computed(() => (typeof props.gap === "number" ? `var(--e-space-${props.gap})` : props.gap));
</script>

<template>
  <component
    :is="as"
    class="e-inline"
    :class="[nowrap && 'e-inline--nowrap', justify && `e-inline--j-${justify}`, align && `e-inline--a-${align}`]"
    :style="{ '--_gap': gapValue }"
  >
    <slot />
  </component>
</template>

<style>
@layer e.blocks {
  .e-inline {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--_gap, var(--e-space-2));
    min-width: 0;
  }

  .e-inline--nowrap {
    flex-wrap: nowrap;
  }

  .e-inline--j-start {
    justify-content: flex-start;
  }

  .e-inline--j-center {
    justify-content: center;
  }

  .e-inline--j-between {
    justify-content: space-between;
  }

  .e-inline--j-end {
    justify-content: flex-end;
  }

  .e-inline--a-start {
    align-items: flex-start;
  }

  .e-inline--a-center {
    align-items: center;
  }

  .e-inline--a-end {
    align-items: flex-end;
  }

  .e-inline--a-stretch {
    align-items: stretch;
  }

  .e-inline--a-baseline {
    align-items: baseline;
  }
}
</style>
