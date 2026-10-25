<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useMessages } from "../../config.js";
import { useAnnouncer } from "../../composables/useAnnouncer.js";
import type { Size } from "../../types.js";
import SpinnerRing from "./SpinnerRing.vue";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** Shown beside the ring, and announced politely when the spinner appears or the label changes. Without one, screen readers hear "Loading". */
    label?: string;
    /** The ring: `sm` 20px, `md` 28px, `lg` 40px. */
    size?: Extract<Size, "sm" | "md" | "lg">;
    /** Centre it in a panel. */
    block?: boolean;
    /** Leaves the announcement to a parent that says what is loading itself. The words stay for anyone who reads the page. */
    silent?: boolean;
  }>(),
  { size: "md" },
);

const t = useMessages();
const { announce } = useAnnouncer();
const words = computed(() => props.label || t("loading"));

/*
 * A live region that arrives with its words already in it is missed by several screen readers, so the spinner is not
 * one: it says its words through the page's shared live region, which is there before anything is said.
 */
onMounted(() => props.silent || announce(words.value));
watch(words, (now) => props.silent || announce(now));
</script>

<template>
  <span class="e-spinner" :class="[size !== 'md' && `e-spinner--${size}`, block && 'e-spinner--block']">
    <SpinnerRing class="e-spinner-ring" />
    <span :class="label ? 'e-spinner-label' : 'e-sr'">{{ words }}</span>
  </span>
</template>

<style>
@layer e.primitives {
  .e-spinner {
    --_size: var(--e-icon-size-lg);

    display: inline-flex;
    align-items: center;
    gap: var(--e-gap-snug);
    color: var(--e-ink);
  }

  .e-spinner--sm {
    --_size: var(--e-icon-size-md);
  }

  .e-spinner--lg {
    --_size: var(--e-icon-size-xl);
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
