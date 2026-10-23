<script setup lang="ts">
import { useMessages } from "../../config.js";
import SpinnerRing from "./SpinnerRing.vue";
import "../../styles/base.css";

defineProps<{
  /** Shown beside the ring and announced politely when it appears. Without it the ring is not a live region and reads as "Loading". */
  label?: string;
  /** A smaller ring. */
  small?: boolean;
  /** A larger ring. */
  large?: boolean;
  /** Centre it in a panel. */
  block?: boolean;
}>();

const t = useMessages();
</script>

<template>
  <span
    class="e-spinner"
    :class="{ 'e-spinner--small': small, 'e-spinner--large': large, 'e-spinner--block': block }"
    :role="label ? 'status' : undefined"
  >
    <SpinnerRing class="e-spinner-ring" />
    <span :class="label ? 'e-spinner-label' : 'e-sr'">{{ label || t("loading") }}</span>
  </span>
</template>

<style>
@layer e.primitives {
  .e-spinner {
    --_size: var(--e-icon-size-md);

    display: inline-flex;
    align-items: center;
    gap: var(--e-space-2);
    color: var(--e-ink);
  }

  .e-spinner--small {
    --_size: var(--e-icon-size);
  }

  .e-spinner--large {
    --_size: var(--e-icon-size-lg);
  }

  .e-spinner--block {
    display: flex;
    justify-content: center;
    padding-block: var(--e-space-8);
  }

  /* The ring is the primary colour; the label beside it is quieter. */
  .e-spinner .e-spinner-ring {
    width: var(--_size);
    height: var(--_size);
    color: var(--e-primary);
  }

  .e-spinner-label {
    font: var(--e-weight-medium) var(--e-text-sm) / 1.3 var(--e-font-sans);
    color: var(--e-muted);
  }
}
</style>
