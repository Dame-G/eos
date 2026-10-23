<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const root = ref<HTMLElement | null>(null);
/** Only a body that actually scrolls takes a tab stop, so the keyboard can scroll it. A body that fits has none. */
const scrollable = ref(false);

let resize: ResizeObserver | undefined;
let mutate: MutationObserver | undefined;

function measure() {
  const el = root.value;
  scrollable.value = !!el && el.scrollHeight > el.clientHeight + 1;
}

/** Watches the body and its children, since the body keeps its size while its content grows. */
function observe() {
  const el = root.value;
  if (!el || !resize) return;
  resize.disconnect();
  resize.observe(el);
  for (const child of el.children) resize.observe(child);
  measure();
}

onMounted(() => {
  if (typeof ResizeObserver === "undefined") return;
  resize = new ResizeObserver(measure);
  mutate = new MutationObserver(observe);
  if (root.value) mutate.observe(root.value, { childList: true });
  observe();
});

onBeforeUnmount(() => {
  resize?.disconnect();
  mutate?.disconnect();
});
</script>

<template>
  <div ref="root" class="e-drawer-body" :tabindex="scrollable ? 0 : undefined"><slot /></div>
</template>
