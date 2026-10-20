<script setup lang="ts">
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** 14px, for captions and fine print. */
    small?: boolean;
    /** 18px, for the one-sentence reading of a statement. */
    large?: boolean;
    /** Secondary copy, in the muted colour. */
    muted?: boolean;
    /** The element to render. */
    as?: string;
  }>(),
  { as: "p" },
);

defineSlots<{
  /** The text. */
  default(): unknown;
}>();
</script>

<template>
  <component :is="as" class="e-text" :class="[small && 'e-text--small', large && 'e-text--large', muted && 'e-text--muted']"><slot /></component>
</template>

<style>
@layer e.primitives {
  .e-text {
    margin: 0;
    max-width: var(--e-measure);
    font: 400 var(--e-text-md) / 24px var(--e-font-sans);
    color: var(--e-ink);
    text-wrap: pretty;
  }

  .e-text--large {
    font-size: var(--e-text-lg);
    line-height: 26px;
  }

  .e-text--small {
    font-size: var(--e-text-sm);
    line-height: 20px;
  }

  .e-text--muted {
    color: var(--e-muted);
  }
}
</style>
