<script setup lang="ts">
import { computed, useSlots } from "vue";
import EActions from "../Actions/EActions.vue";
import { useGap, type GapToken } from "../Stack/gap.js";
import type { ElementTag } from "../../types.js";
import { isProduction } from "../../env.js";
import { warnOnce } from "../../warn.js";
import "../../styles/base.css";

/** The looks of a surface. */
export type SurfaceVariant = "paper" | "raised" | "outline" | "tinted";

const props = withDefaults(
  defineProps<{
    /** The element to render, such as `article`, `section` or `aside` for a real block. */
    as?: ElementTag;
    /** The padding: a gap name (`tight`, `snug`, `base`, `loose`, `section`), a space token number or a CSS length. Left out, it is the card padding (`pad-card`). @default pad-card */
    padding?: GapToken | string;
    /** No padding (`padding="0"`), so a table, an image or a list can run edge to edge. */
    flush?: boolean;
    /** `paper` is a warm ground and a pressed edge, for a statement or receipt. `raised` is the lifted shadow of something floating above the page, such as a Toast. `outline` has no fill, so the page shows through. `tinted` is a tinted ground for a block that sits beside plain ones. */
    variant?: SurfaceVariant;
    /** Hides what overflows the rounded corners. Ignored when there is an `actions` slot. */
    clip?: boolean;
  }>(),
  { as: "div" },
);

defineSlots<{
  /** The content of the card. */
  default(): unknown;
  /** Buttons for a bar at the foot of the card, edge to edge. The body takes the remaining height so cards in a row end level. */
  actions(): unknown;
}>();

const slots = useSlots();
const padCss = useGap(() => (props.flush ? undefined : props.padding));
const padStyle = computed(() => (padCss.value ? { padding: padCss.value } : undefined));
/** In a sectioning element the action bar is the block's own footer; anywhere else it is a plain group. */
const SECTIONING = new Set<string>(["article", "section", "aside"]);
const barElement = computed(() => (SECTIONING.has(props.as) ? "footer" : "div"));

if (props.flush && props.padding !== undefined)
  warnOnce("ESurface-flush", "ESurface takes `flush` or `padding`, not both; `flush` is padding 0 and wins.");
if (props.clip && slots.actions && !isProduction()) {
  console.warn("[eos] ESurface `clip` is ignored when there is an `actions` slot; the surface already clips.");
}
</script>

<template>
  <component
    :is="as"
    class="e-surface"
    :class="[
      variant && `e-surface--${variant}`,
      flush && 'e-surface--flush',
      $slots.actions ? 'e-surface--actions' : clip && 'e-surface--clip',
    ]"
    :style="$slots.actions ? undefined : padStyle"
  >
    <template v-if="$slots.actions">
      <div class="e-surface-body" :style="padStyle">
        <slot />
      </div>
      <EActions :as="barElement" bar>
        <slot name="actions" />
      </EActions>
    </template>
    <slot v-else />
  </component>
</template>

<style>
@layer e.blocks {
  /* The padding is pad-card unless `padding` sets it inline or `flush` takes it off; with an action bar it moves to the body. A component built on a flush surface pads it from its own layer. */
  .e-surface {
    min-width: 0;
    padding: var(--e-pad-card);
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
    box-shadow: var(--e-shadow-frame);
  }

  .e-surface--flush,
  .e-surface--flush > .e-surface-body {
    padding: 0;
  }

  .e-surface--clip {
    overflow: hidden;
  }

  .e-surface--actions {
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .e-surface-body {
    padding: var(--e-pad-card);
    flex: 1;
    min-width: 0;
  }

  .e-surface > .e-actions--bar:last-child {
    border-end-start-radius: var(--e-radius-md);
    border-end-end-radius: var(--e-radius-md);
  }

  .e-surface--paper {
    background: var(--e-surface-paper);
    box-shadow: var(--e-shadow-paper);
  }

  .e-surface--raised {
    box-shadow: var(--e-shadow-float);
  }

  .e-surface--outline {
    background: transparent;
  }

  .e-surface--tinted {
    background: var(--e-surface-tint);
  }

  @media (forced-colors: active) {
    /* The frame is a shadow, which forced colours drop, so the surface draws its edge as an outline. */
    .e-surface {
      outline: var(--e-stroke-edge) solid CanvasText;
    }
  }
}
</style>
