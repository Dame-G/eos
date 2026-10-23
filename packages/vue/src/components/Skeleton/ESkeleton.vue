<script setup lang="ts">
import { computed } from "vue";
import "../../styles/base.css";

const props = defineProps<{
  /** A number is in px and a string is any CSS length. @default 96 */
  height?: number | string;
  /** Same units as `height`. @default full width */
  width?: number | string;
  /** A round block, for a photo. The width follows `height`. */
  circle?: boolean;
}>();

const px = (v: number | string) => (typeof v === "number" ? `${v}px` : v);
const size = computed(() => ({
  height: px(props.height ?? 96),
  ...(props.width != null ? { width: px(props.width) } : {}),
}));
</script>

<template>
  <div class="e-skeleton" :class="{ 'e-skeleton--circle': circle }" :style="size" aria-hidden="true"></div>
</template>

<style>
@layer e.primitives {
  /* The one owner of the loading placeholder: `.e-skeleton` is the block and `.e-skel` the line of text a table cell or list row uses. No container or outline: a faint neutral tint with the same diagonal stripes as a busy button and the progress bar, pulsing. */
  .e-skeleton,
  .e-skel {
    display: block;
    background-color: var(--e-skeleton);
    background-image: repeating-linear-gradient(
      135deg,
      transparent 0 var(--e-space-2),
      var(--e-wash-hover) var(--e-space-2) var(--e-space-4)
    );
    animation: e-pulse var(--e-duration-loop) var(--e-easing-standard) infinite;
  }

  .e-skeleton {
    width: 100%;
    border-radius: var(--e-radius-md);
  }

  .e-skel {
    height: var(--e-space-4);
    border-radius: var(--e-radius-sm);
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
      forced-color-adjust: none;
      background: GrayText;
    }
  }
}
</style>
