<script setup lang="ts">
import { computed } from "vue";
import { useIconResolver } from "../../config.js";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";

const props = defineProps<{
  /** A name (from the built-in list or your icon set, such as `"credit-card"` or `"lucide:credit-card"`), or an icon component. */
  name: IconProp;
  /** 14px with the bold weight, for chips and stamps. */
  small?: boolean;
  /** The bold weight at the normal size, where the icon set has one. */
  bold?: boolean;
}>();

const resolve = useIconResolver();
const resolved = computed(() => resolve(props.name as string, !!(props.small || props.bold)));
// Arrows and chevrons that point left or right mirror in right-to-left text.
const directional = computed(() => typeof props.name === "string" && /-(left|right)$/.test(props.name));
</script>

<template>
  <component
    :is="resolved.component"
    v-if="resolved.kind === 'component'"
    class="e-icon"
    :class="{ 'e-icon--s': small, 'e-icon--dir': directional }"
    aria-hidden="true"
    focusable="false"
  />
  <span
    v-else-if="resolved.kind === 'svg'"
    class="e-icon e-icon--svg"
    :class="{ 'e-icon--s': small, 'e-icon--dir': directional }"
    aria-hidden="true"
    v-html="resolved.html"
  />
  <svg
    v-else-if="resolved.kind === 'glyph'"
    class="e-icon e-icon--glyph"
    :class="{ 'e-icon--s': small, 'e-icon--dir': directional }"
    :viewBox="resolved.viewBox"
    aria-hidden="true"
    focusable="false"
    v-html="resolved.html"
  />
</template>

<style>
@layer e.primitives {
  .e-icon {
    flex: none;
    width: 20px;
    height: 20px;
  }

  /* The built-in glyphs are filled paths. Icons from other sets keep their own fill and stroke (usually currentColor). */
  .e-icon--glyph {
    fill: currentcolor;
    stroke: none;
  }

  /* A complete <svg> string sits in a box of the icon's size. */
  .e-icon--svg {
    display: inline-flex;
  }

  .e-icon--svg > svg {
    width: 100%;
    height: 100%;
  }

  .e-icon--s {
    width: 14px;
    height: 14px;
  }

  :dir(rtl) .e-icon--dir {
    transform: scaleX(-1);
  }
}
</style>
