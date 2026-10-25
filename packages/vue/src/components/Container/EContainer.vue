<script setup lang="ts">
import type { ElementTag } from "../../composables/useSize.js";
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** The element to render, such as `main` or `section`. */
    as?: ElementTag;
    /** The widest it grows: `sm` 40rem, `md` 60rem, `lg` 80rem, or `full` for the whole width. It is centred when narrower than its parent. */
    width?: "sm" | "md" | "lg" | "full";
    /** Keeps the page gutter at its sides, so content never touches the screen edge. `false` for a container that sits inside another that already has one. */
    gutter?: boolean;
  }>(),
  { as: "div", width: "lg", gutter: true },
);

defineSlots<{
  /** The content. */
  default(): unknown;
}>();
</script>

<template>
  <component :is="as" class="e-container" :class="[`e-container--${width}`, !gutter && 'e-container--flush']">
    <slot />
  </component>
</template>

<style>
@layer e.blocks {
  /* The widths (40, 60 and 80rem) have no token yet; they are the page column steps. */
  .e-container {
    --_max: 80rem;

    box-sizing: border-box;
    inline-size: 100%;
    max-inline-size: var(--_max);
    margin-inline: auto;
    padding-inline: var(--e-gutter);
    min-width: 0;
  }

  .e-container--sm {
    --_max: 40rem;
  }

  .e-container--md {
    --_max: 60rem;
  }

  .e-container--full {
    --_max: none;
  }

  .e-container--flush {
    padding-inline: 0;
  }
}
</style>
