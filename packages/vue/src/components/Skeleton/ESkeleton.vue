<script setup lang="ts">
import { computed } from "vue";
import "../../styles/base.css";
import "./skeleton.css";

const props = defineProps<{
  /** A number is in px and a string is any CSS length. Ignored with `lines` or `text`. @default 96 */
  height?: number | string;
  /** Same units as `height`. @default full width */
  width?: number | string;
  /** A round block, for a photo. The width follows `height`. */
  circle?: boolean;
  /** Draws this many lines of text, the last one shorter, instead of a block. */
  lines?: number;
  /** One line of text. Same as `lines` of 1. */
  text?: boolean;
  /** Names what is loading. The skeleton becomes a polite `status` region that reads this, instead of being hidden from screen readers. */
  label?: string;
}>();

const px = (v: number | string) => (typeof v === "number" ? `${v}px` : v);
const count = computed(() => props.lines ?? (props.text ? 1 : 0));
const size = computed(() => ({
  height: px(props.height ?? 96),
  ...(props.width != null ? { width: px(props.width) } : {}),
}));
const style = computed(() =>
  count.value ? (props.width != null ? { width: px(props.width) } : undefined) : size.value,
);
</script>

<template>
  <div
    :class="count ? 'e-skeleton-lines' : ['e-skeleton', circle && 'e-skeleton--circle']"
    :style="style"
    :role="label ? 'status' : undefined"
    :aria-hidden="label ? undefined : 'true'"
  >
    <span v-if="label" class="e-sr">{{ label }}</span>
    <template v-if="count">
      <span v-for="n in count" :key="n" class="e-skel" aria-hidden="true"></span>
    </template>
  </div>
</template>
