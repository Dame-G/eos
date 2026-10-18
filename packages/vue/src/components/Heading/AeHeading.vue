<script setup lang="ts">
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** 1 to 3: sets both the element (`h1` to `h3`) and the size (36, 24 and 20px). One level 1 per page; do not skip levels. */
    level?: 1 | 2 | 3;
    /** A small mono label above the heading. */
    kicker?: string;
  }>(),
  { level: 2 },
);

defineSlots<{
  /** The heading text. */
  default(): unknown;
}>();
</script>

<template>
  <div class="ae-heading">
    <p v-if="kicker" class="ae-kicker" style="margin: 0">{{ kicker }}</p>
    <component :is="`h${level}`" class="ae-h" :class="`ae-h${level}`"><slot /></component>
  </div>
</template>

<style>
@layer ae.primitives {
  .ae-heading {
    display: grid;
    gap: var(--ae-space-1);
  }

  .ae-h {
    margin: 0;
    font-family: var(--ae-font-sans);
    font-weight: 500;
    color: var(--ae-ink);
    text-wrap: balance;
  }

  .ae-h1 {
    font-size: var(--ae-text-4xl);
    line-height: 1.15;
  }

  .ae-h2 {
    font-size: var(--ae-text-2xl);
    line-height: 1.25;
  }

  .ae-h3 {
    font-size: var(--ae-text-xl);
    line-height: 1.25;
  }
}
</style>
