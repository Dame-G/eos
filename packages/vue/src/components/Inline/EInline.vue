<script setup lang="ts">
import { computed } from "vue";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The element to render, `div` by default; for example `ul`. */
    as?: string;
    /** A space token number (1, 2, 3, 4, 6, 8), or any CSS length as a string. */
    gap?: number | string;
    /** Main-axis placement: `between` or `end`; start by default. */
    justify?: "between" | "end";
    /** Cross-axis alignment: `start` or `baseline`; centred by default. */
    align?: "start" | "baseline";
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
    :class="[nowrap && 'e-inline--nowrap', justify && `e-inline--${justify}`, align && `e-inline--a-${align}`]"
    :style="{ '--e-gap': gapValue }"
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
    gap: var(--e-gap, var(--e-space-2));
    min-width: 0;
  }

  .e-inline--nowrap {
    flex-wrap: nowrap;
  }

  .e-inline--between {
    justify-content: space-between;
  }

  .e-inline--end {
    justify-content: flex-end;
  }

  .e-inline--a-start {
    align-items: flex-start;
  }

  .e-inline--a-baseline {
    align-items: baseline;
  }
}
</style>
