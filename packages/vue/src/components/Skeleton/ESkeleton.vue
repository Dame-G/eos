<script setup lang="ts">
import { computed } from "vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

const props = defineProps<{
  /** Height in px, or any CSS length. Defaults to 96. Make it the size of what is coming. */
  height?: number | string;
  /** Width in px, or any CSS length. Defaults to the full width. */
  width?: number | string;
  /** A round block, for a photo. */
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
    box-shadow: inset 0 0 0 1px var(--e-border);
    animation: e-pulse 1.4s ease-in-out infinite;
  }

  /* A text-line placeholder, used by lists and grids while rows load. */
  .e-skel {
    display: block;
    height: 14px;
    border-radius: var(--e-radius-sm);
    background: var(--e-surface-tint);
    box-shadow: inset 0 0 0 1px var(--e-border);
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
}
</style>
