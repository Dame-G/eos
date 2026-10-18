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
  <div class="e-heading">
    <p v-if="kicker" class="e-kicker" style="margin: 0">{{ kicker }}</p>
    <component :is="`h${level}`" class="e-h" :class="`e-h${level}`"><slot /></component>
  </div>
</template>

<style>
@layer e.primitives {
  .e-heading {
    display: grid;
    gap: var(--e-space-1);
  }

  .e-h {
    margin: 0;
    font-family: var(--e-font-sans);
    font-weight: 500;
    color: var(--e-ink);
    text-wrap: balance;
  }

  .e-h1 {
    font-size: var(--e-text-4xl);
    line-height: 1.15;
  }

  .e-h2 {
    font-size: var(--e-text-2xl);
    line-height: 1.25;
  }

  .e-h3 {
    font-size: var(--e-text-xl);
    line-height: 1.25;
  }
}
</style>
