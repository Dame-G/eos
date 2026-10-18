<script setup lang="ts">
import { useMessages } from "../../config.js";
import "../../styles/base.css";

defineProps<{
  /** Shown beside the ring. Without it the ring is announced as "Loading". */
  label?: string;
  /** Centre it in a panel. */
  block?: boolean;
}>();

const t = useMessages();
</script>

<template>
  <span class="ae-spinner" :class="{ 'ae-spinner--block': block }" role="status">
    <svg class="ae-spinner-ring" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /></svg>
    <span :class="label ? 'ae-spinner-label' : 'ae-sr'">{{ label || t("loading") }}</span>
  </span>
</template>

<style>
@layer ae.primitives {
  .ae-spinner {
    display: inline-flex;
    align-items: center;
    gap: var(--ae-space-2);
    color: var(--ae-ink);
  }

  .ae-spinner--block {
    display: flex;
    justify-content: center;
    padding: var(--ae-space-8) 0;
  }

  .ae-spinner-ring {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: var(--ae-primary);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: 36 56;
    animation: ae-spin 0.9s linear infinite;
  }

  .ae-spinner-label {
    font: 500 var(--ae-text-sm) / 1.3 var(--ae-font-sans);
    color: var(--ae-muted);
  }

  @keyframes ae-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-spinner-ring {
      animation-duration: 3s;
    }
  }
}
</style>
