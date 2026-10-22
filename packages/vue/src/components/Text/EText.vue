<script setup lang="ts">
import { computed } from "vue";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** Smaller text, for captions and fine print. `textScale` rescales it. */
    small?: boolean;
    /** Larger text, for the one-sentence reading of a statement. `textScale` rescales it. */
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

const sizes = computed(() => [
  props.small && "e-text--small",
  props.large && "e-text--large",
  props.muted && "e-text--muted",
]);
</script>

<template>
  <component :is="as" class="e-text" :class="sizes"><slot /></component>
</template>

<style>
@layer e.primitives {
  .e-text {
    margin: 0;
    max-width: var(--e-measure);
    font: 400 var(--e-text-md) / 1.5 var(--e-font-sans);
    color: var(--e-ink);
    text-wrap: pretty;
  }

  .e-text--large {
    font-size: var(--e-text-lg);
    line-height: calc(26 / 18);
  }

  .e-text--small {
    font-size: var(--e-text-sm);
    line-height: calc(20 / 14);
  }

  .e-text--muted {
    color: var(--e-muted);
  }
}
</style>
