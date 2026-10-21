<script setup lang="ts">
import { useMessages } from "../../config.js";
import SpinnerRing from "./SpinnerRing.vue";
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
    <SpinnerRing class="e-spinner-ring" />
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

  /* The ring is the primary colour at 24px; the label beside it is quieter. */
  .e-spinner .e-spinner-ring {
    width: 24px;
    height: 24px;
    color: var(--e-primary);
  }

  .e-spinner-label {
    font: 500 var(--e-text-sm) / 1.3 var(--e-font-sans);
    color: var(--e-muted);
  }
}
</style>
