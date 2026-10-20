<script setup lang="ts">
import { computed } from "vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

const props = defineProps<{
  /** A number is px; a string is any CSS length. @default 96 */
  height?: number | string;
  /** Same units as `height`. @default full width */
  width?: number | string;
  /** A round block, for a photo; set `height` and the width follows. */
  circle?: boolean;
}>();

const t = useMessages();
const px = (v: number | string) => (typeof v === "number" ? `${v}px` : v);
const size = computed(() => ({
  height: px(props.height ?? 96),
  ...(props.width != null ? { width: px(props.width) } : {}),
}));
</script>

<template>
  <div class="e-skeleton" :class="{ 'e-skeleton--circle': circle }" :style="size" role="status" aria-busy="true">
    <span class="e-sr">{{ t("loading") }}</span>
  </div>
</template>

<style>
@layer e.primitives {
  .e-skeleton {
    display: block;
    width: 100%;
    border-radius: var(--e-radius-md);
    background: var(--e-surface-tint);
    box-shadow: inset 0 0 0 var(--e-stroke-card) var(--e-border-strong);
    outline: var(--e-stroke-card) solid var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-card));
    animation: e-pulse 1.4s ease-in-out infinite;
  }

  .e-skel {
    display: block;
    height: 14px;
    border-radius: var(--e-radius-sm);
    background: var(--e-surface-tint);
    box-shadow: inset 0 0 0 var(--e-stroke-card) var(--e-border-strong);
    outline: var(--e-stroke-card) solid var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-card));
    animation: e-pulse 1.4s ease-in-out infinite;
  }

  .e-skeleton--circle {
    width: auto;
    aspect-ratio: 1;
    border-radius: 50%;
  }

  @keyframes e-pulse {
    50% {
      opacity: 0.5;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .e-skel,
    .e-skeleton {
      animation: none;
    }
  }

  @media (forced-colors: active) {
    .e-skel,
    .e-skeleton {
      outline-color: GrayText;
    }
  }
}
</style>
