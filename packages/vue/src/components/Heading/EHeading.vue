<script setup lang="ts">
import EKicker from "../Kicker/EKicker.vue";
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** 1 to 6. Sets both the element (`h1` to `h6`) and the size. The default sizes are 36, 24, 20, 18, 16 and 14px, and `textScale` rescales them. Use one level 1 per page and do not skip levels. */
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    /** A label above the heading. It renders an `EKicker`, which is not itself a heading. */
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
    <EKicker v-if="kicker">{{ kicker }}</EKicker>
    <component :is="`h${level}`" class="e-h" :class="`e-h${level}`"><slot /></component>
  </div>
</template>

<style>
@layer e.primitives {
  .e-heading {
    display: grid;
    gap: var(--e-space-1);
  }

  .e-heading > .e-kicker {
    margin: 0;
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

  .e-h4 {
    font-size: var(--e-text-lg);
    line-height: 1.3;
  }

  .e-h5 {
    font-size: var(--e-text-md);
    line-height: 1.3;
  }

  .e-h6 {
    font-size: var(--e-text-sm);
    line-height: 1.3;
  }
}
</style>
