<script setup lang="ts">
import { computed } from "vue";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The element to render, `div` by default. */
    as?: string;
    /** A space token number (1, 2, 3, 4, 6, 8), or any CSS length as a string. */
    gap?: number | string;
    /** `between` or `end`; start by default. */
    justify?: "between" | "end";
    /** `start` or `baseline`; centred by default. */
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

const gapValue = computed(() => (typeof props.gap === "number" ? `var(--ae-space-${props.gap})` : props.gap));
</script>

<template>
  <component
    :is="as"
    class="ae-inline"
    :class="[nowrap && 'ae-inline--nowrap', justify && `ae-inline--${justify}`, align && `ae-inline--a-${align}`]"
    :style="{ '--ae-gap': gapValue }"
  >
    <slot />
  </component>
</template>

<style>
@layer ae.blocks {
  .ae-inline {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ae-gap, var(--ae-space-2));
    min-width: 0;
  }

  .ae-inline--nowrap {
    flex-wrap: nowrap;
  }

  .ae-inline--between {
    justify-content: space-between;
  }

  .ae-inline--end {
    justify-content: flex-end;
  }

  .ae-inline--a-start {
    align-items: flex-start;
  }

  .ae-inline--a-baseline {
    align-items: baseline;
  }
}
</style>
