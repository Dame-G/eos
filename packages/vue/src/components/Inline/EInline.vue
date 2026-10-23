<script setup lang="ts">
import { computed } from "vue";
import { useGap, type GapToken } from "../Stack/gap.js";
import { useListRole } from "../Stack/list.js";
import { useDeprecated, type ElementTag } from "../../composables/useSize.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The element to render, such as `ul` (with `li` children). `ul` and `ol` lose their bullets and padding and keep their list role. */
    as?: ElementTag;
    /** `tight`, `snug`, `base`, `loose` or `section` (the gap tokens), or a space token number (1 to 8, 10, 12 or 16) for `var(--e-space-N)`. A string is used as given, so any CSS length works. */
    gap?: GapToken | string;
    /** Main-axis placement. `between` spreads the children apart. Left out, they sit at the start. */
    justify?: "start" | "center" | "end" | "between";
    /** Cross-axis alignment. `start` aligns the top edges and `baseline` aligns the text baselines. Left out, the children are centred. */
    align?: "start" | "center" | "end" | "stretch" | "baseline";
    /** Wraps the children onto further lines when they run out of room. `false` keeps them on one line. */
    wrap?: boolean;
    /** @deprecated Use `:wrap="false"`. */
    nowrap?: boolean;
  }>(),
  { as: "div", gap: "snug", wrap: true },
);

defineSlots<{
  /** The children, in a row that wraps when it runs out of room. */
  default(): unknown;
}>();

const gapCss = useGap(() => props.gap);
const single = computed(() => !props.wrap || props.nowrap);
const listRole = useListRole(() => props.as);
useDeprecated("EInline", props, { nowrap: ':wrap="false"' });
</script>

<template>
  <component
    :is="as"
    class="e-inline"
    :class="[single && 'e-inline--nowrap', justify && `e-inline--j-${justify}`, align && `e-inline--a-${align}`]"
    :role="listRole"
    :style="{ '--_gap': gapCss }"
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
    gap: var(--_gap, var(--e-gap-snug));
    min-width: 0;
  }

  .e-inline:is(ul, ol) {
    margin: 0;
    padding: 0;
    list-style: none;
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
