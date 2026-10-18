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
  <span class="e-spinner" :class="{ 'e-spinner--block': block }" role="status">
    <svg class="e-spinner-ring" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /></svg>
    <span :class="label ? 'e-spinner-label' : 'e-sr'">{{ label || t("loading") }}</span>
  </span>
</template>

<style>
@layer e.primitives {
  .e-spinner {
    display: inline-flex;
    align-items: center;
    gap: var(--e-space-2);
    color: var(--e-ink);
  }

  .e-spinner--block {
    display: flex;
    justify-content: center;
    padding: var(--e-space-8) 0;
  }

  .e-spinner-ring {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: var(--e-primary);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: 36 56;
    animation: e-spin 0.9s linear infinite;
  }

  .e-spinner-label {
    font: 500 var(--e-text-sm) / 1.3 var(--e-font-sans);
    color: var(--e-muted);
  }

  @keyframes e-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .e-spinner-ring {
      animation-duration: 3s;
    }
  }
}
</style>
