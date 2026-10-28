<script setup lang="ts">
import type { ElementTag } from "../../types.js";
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** Sets the element to render. `footer` suits a bar at the end of a card. */
    as?: ElementTag;
    /** Makes the group a footer bar for actions that end a card or an overlay. Buttons stack full width when the bar is narrow. Leave it off for the next step on a page. */
    bar?: boolean;
    /** Stacks the buttons full width: `narrow` below 24rem of the group's own width (as a `bar` does: a phone, not a dialog or a card), `always` at every width, `never` keeps them side by side (a `bar` then ends at the end edge). The group then fills its container's width. */
    stack?: "narrow" | "always" | "never";
    /** Names the group for screen readers, for example "Record actions", and renders `role="group"` with `aria-label`. Use it for buttons that belong together, such as a filter row. */
    label?: string;
  }>(),
  { as: "div" },
);

defineSlots<{
  /** The Buttons, in the order of the content, the main action first. */
  default(): unknown;
}>();
</script>

<template>
  <component
    :is="as"
    class="e-actions"
    :class="[bar && 'e-actions--bar', stack && `e-actions--stack-${stack}`]"
    :role="label ? 'group' : undefined"
    :aria-label="label"
  >
    <slot />
  </component>
</template>

<style>
@layer e.blocks {
  .e-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--e-gap-snug);
  }

  .e-actions--bar {
    padding: var(--e-pad-control-sm) var(--e-pad-card);
    border-top: var(--e-stroke-hair) solid var(--e-border);
    background: var(--e-surface-tint);
  }

  /* The group's own width decides when its buttons stack, not the viewport. */
  .e-actions:is(.e-actions--bar:not([class*="e-actions--stack-"]), .e-actions--stack-narrow) {
    container-type: inline-size;
  }

  .e-actions--bar.e-actions--stack-never {
    justify-content: flex-end;
  }

  .e-actions--stack-always > .e-btn {
    flex: 1 1 100%;
  }

  @container (max-width: 24rem) {
    .e-actions:is(.e-actions--bar:not([class*="e-actions--stack-"]), .e-actions--stack-narrow) > .e-btn {
      flex: 1 1 100%;
    }
  }

  @media print {
    .e-actions {
      display: none;
    }
  }
}
</style>
