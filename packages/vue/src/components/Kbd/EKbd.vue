<script setup lang="ts">
import type { Size } from "../../composables/useSize.js";
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** `sm` is for a hint inside small text. */
    size?: Extract<Size, "sm" | "md">;
  }>(),
  { size: "md" },
);

defineSlots<{
  /** The key, written as it is on the keycap: "/", "Esc", "Ctrl". */
  default(): unknown;
}>();
</script>

<template>
  <kbd class="e-kbd" :class="size === 'sm' && 'e-kbd--s'"><slot /></kbd>
</template>

<style>
@layer e.primitives {
  .e-kbd {
    display: inline-block;

    /* As wide as its content, also as the child of a grid or a column, which would otherwise stretch it. */
    inline-size: fit-content;
    max-inline-size: 100%;
    min-width: 1.5em;
    padding: 0 var(--e-gap-tight);
    border: var(--e-stroke-edge) solid var(--e-border-strong);
    border-bottom-width: calc(var(--e-stroke-edge) + var(--e-slab-thin));
    border-radius: var(--e-radius-sm);

    /* The bottom corners are as much taller than wide as the slab is thick, so the face inside them is a true circle like the top ones (a corner whose border is thicker on one side than the other has an elliptical inside, which reads as a diagonal). */
    border-bottom-left-radius: var(--e-radius-sm) calc(var(--e-radius-sm) + var(--e-slab-thin));
    border-bottom-right-radius: var(--e-radius-sm) calc(var(--e-radius-sm) + var(--e-slab-thin));
    background: var(--e-surface-tint);
    background-clip: padding-box;
    color: var(--e-muted);
    font: var(--e-weight-medium) var(--e-text-sm) / var(--e-leading-normal) var(--e-font-mono);
    text-align: center;
    white-space: nowrap;
  }

  .e-kbd--s {
    font-size: var(--e-text-xs);
  }
}
</style>
