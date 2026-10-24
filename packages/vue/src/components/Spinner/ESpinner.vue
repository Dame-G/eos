<script setup lang="ts">
import { useMessages } from "../../config.js";
import type { Size } from "../../composables/useSize.js";
import SpinnerRing from "./SpinnerRing.vue";
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** Shown beside the ring. The spinner is a `status` region, so a label that appears with it is announced politely. Without one, screen readers get "Loading". */
    label?: string;
    /** The ring: `sm` 20px, `md` 28px, `lg` 40px. */
    size?: Extract<Size, "sm" | "md" | "lg">;
    /** Centre it in a panel. */
    block?: boolean;
  }>(),
  { size: "md" },
);

const t = useMessages();
</script>

<template>
  <span class="e-spinner" :class="[size !== 'md' && `e-spinner--${size}`, block && 'e-spinner--block']" role="status">
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
    gap: var(--e-gap-snug);
    color: var(--e-ink);
  }

  .e-spinner--sm {
    --_size: var(--e-icon-size);
  }

  .e-spinner--lg {
    --_size: var(--e-icon-size-lg);
  }

  .e-spinner--block {
    display: flex;
    justify-content: center;
    padding-block: var(--e-gap-section);
  }

  /* The ring is the primary colour; the label beside it is quieter. */
  .e-spinner .e-spinner-ring {
    width: var(--_size);
    height: var(--_size);
    color: var(--e-primary);
  }

  .e-spinner-label {
    font: var(--e-weight-medium) var(--e-text-sm) / var(--e-leading-snug) var(--e-font-sans);
    color: var(--e-muted);
  }
}
</style>
