<script setup lang="ts">
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** `body` 16px, `deck` 18px for the one-sentence reading of a statement, `small` 14px. */
    variant?: "body" | "deck" | "small";
    /** Secondary copy, in the muted colour. */
    muted?: boolean;
    /** The element to render. */
    as?: string;
  }>(),
  { variant: "body", as: "p" },
);

defineSlots<{
  /** The text. */
  default(): unknown;
}>();
</script>

<template>
  <component :is="as" class="ae-text" :class="[`ae-text--${variant}`, muted && 'ae-text--muted']"><slot /></component>
</template>

<style>
@layer ae.primitives {
  .ae-text {
    margin: 0;
    max-width: var(--ae-measure);
    font: 400 var(--ae-text-md) / 24px var(--ae-font-sans);
    color: var(--ae-ink);
    text-wrap: pretty;
  }

  .ae-text--deck {
    font-size: var(--ae-text-lg);
    line-height: 26px;
  }

  .ae-text--small {
    font-size: var(--ae-text-sm);
    line-height: 20px;
  }

  .ae-text--muted {
    color: var(--ae-muted);
  }
}
</style>
