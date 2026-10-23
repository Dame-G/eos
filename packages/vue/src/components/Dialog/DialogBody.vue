<script setup lang="ts">
import { ref } from "vue";
import { useOverflow } from "../../composables/useOverflow.js";

/** The scrolling body of a dialog or a drawer. The caller gives it its class (`e-dialog-body`, `e-drawer-body`). */
const root = ref<HTMLElement | null>(null);
/** Only a body that actually scrolls takes a tab stop, so the keyboard can scroll it. A body that fits has none. */
const scrollable = useOverflow(root, [], { children: true });
</script>

<template>
  <div ref="root" :tabindex="scrollable ? 0 : undefined"><slot /></div>
</template>
