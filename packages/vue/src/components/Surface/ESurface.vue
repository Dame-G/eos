<script setup lang="ts">
import { computed, useSlots } from "vue";
import EActions from "../Actions/EActions.vue";
import { useGap, type GapToken } from "../Stack/gap.js";
import { useDeprecated, useSize, type ElementTag, type Size } from "../../composables/useSize.js";
import { isProduction } from "../../env.js";
import "../../styles/base.css";

/** The looks of a surface. `tone` is a deprecated name for `tinted`. */
export type SurfaceVariant = "paper" | "raised" | "outline" | "tinted" | "tone";

const props = withDefaults(
  defineProps<{
    /** The element to render, such as `article`, `section` or `aside` for a real block. */
    as?: ElementTag;
    /** The padding as a gap token (`tight` to `section`), a space token number or a CSS length. This is the way to set the padding; `size` is a shorthand for three presets, and `padding` wins over it. */
    padding?: GapToken | string;
    /** A padding preset: `sm`, `md` or `lg`. @default "md" */
    size?: Extract<Size, "sm" | "md" | "lg">;
    /** @deprecated Use `size="sm"`. */
    small?: boolean;
    /** @deprecated Use `size="lg"`. */
    large?: boolean;
    /** No padding, so a table, an image or a list can run edge to edge. */
    flush?: boolean;
    /** @deprecated Use `size`, `padding` or `flush`. */
    pad?: Extract<Size, "sm" | "md" | "lg">;
    /** `paper` is a warm ground and a pressed edge, for a statement or receipt. `raised` is the lifted shadow of something floating above the page, such as a Toast. `outline` has no fill, so the page shows through. `tinted` is a tinted ground for a block that sits beside plain ones (`tone` is a deprecated name for it). */
    variant?: SurfaceVariant;
    /** @deprecated Use `variant="paper"`. */
    paper?: boolean;
    /** @deprecated Use `variant="raised"`. */
    raised?: boolean;
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
const size = useSize(props, "ESurface");
useDeprecated("ESurface", props, {
  pad: "`size`",
  paper: 'variant="paper"',
  raised: 'variant="raised"',
  variant: (v) => (v === "tone" ? 'variant="tinted"' : undefined),
});
const sizeClass = computed(() =>
  props.flush ? null : `e-surface--pad-${props.pad && !props.size ? props.pad : size.value}`,
);
const padCss = useGap(() => props.padding);
const padStyle = computed(() => (padCss.value && !props.flush ? { padding: padCss.value } : undefined));
const variant = computed(() => {
  const given = props.variant ?? (props.paper ? "paper" : props.raised ? "raised" : undefined);
  return given === "tone" ? "tinted" : given;
});
/** In a sectioning element the action bar is the block's own footer; anywhere else it is a plain group. */
const SECTIONING = new Set<string>(["article", "section", "aside"]);
const barElement = computed(() => (SECTIONING.has(props.as) ? "footer" : "div"));

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
      $slots.actions ? 'e-surface--actions' : [sizeClass, clip && 'e-surface--clip'],
    ]"
    :style="$slots.actions ? undefined : padStyle"
  >
    <template v-if="$slots.actions">
      <div class="e-surface-body" :class="sizeClass" :style="padStyle">
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
  .e-surface {
    min-width: 0;
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
    box-shadow: var(--e-frame);
  }

  .e-surface--clip {
    overflow: hidden;
  }

  .e-surface--actions {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .e-surface-body {
    flex: 1;
    min-width: 0;
  }

  .e-surface > .e-actions--bar:last-child {
    border-end-start-radius: var(--e-radius-md);
    border-end-end-radius: var(--e-radius-md);
  }

  .e-surface--paper {
    background: var(--e-surface-paper);
    box-shadow: var(--e-paper);
  }

  .e-surface--raised {
    box-shadow: var(--e-float);
  }

  .e-surface--outline {
    background: transparent;
  }

  .e-surface--tinted {
    background: var(--e-surface-tint);
  }

  .e-surface--pad-sm {
    padding: var(--e-gap-base) var(--e-pad-card);
  }

  .e-surface--pad-md {
    padding: var(--e-pad-card);
  }

  .e-surface--pad-lg {
    padding: var(--e-pad-panel);
  }

  @media (forced-colors: active) {
    .e-surface {
      outline-color: CanvasText;
    }
  }
}
</style>
