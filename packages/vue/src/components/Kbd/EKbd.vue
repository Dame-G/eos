<script setup lang="ts">
import { useSize, type Size } from "../../composables/useSize.js";
import "../../styles/base.css";

const props = defineProps<{
  /** `sm` is for a hint inside small text. */
  size?: Extract<Size, "sm" | "md">;
  /** @deprecated Use `size="sm"`. */
  small?: boolean;
}>();

defineSlots<{
  /** The key, written as it is on the keycap: "/", "Esc", "Ctrl". */
  default(): unknown;
}>();

const size = useSize(props, "EKbd");
</script>

<template>
  <kbd class="e-kbd" :class="size === 'sm' && 'e-kbd--s'"><slot /></kbd>
</template>

<style>
@layer e.primitives {
  .e-kbd {
    display: inline-block;
    min-width: 1.5em;
    padding: 0 var(--e-gap-tight);
    border: var(--e-stroke-edge) solid var(--e-border-strong);
    border-bottom-width: calc(var(--e-stroke-edge) + var(--e-slab-thin));
    border-radius: var(--e-radius-sm);
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
