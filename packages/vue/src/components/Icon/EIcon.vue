<script setup lang="ts">
import { computed } from "vue";
import { useIconResolver } from "../../config.js";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";

const props = defineProps<{
  /** A name (from the built-in list or your icon set, such as `"credit-card"` or `"lucide:credit-card"`), or an icon component. */
  name: IconProp;
  /** The 14px size, drawn in the bold weight, for chips and stamps. */
  small?: boolean;
  /** The bold weight at the normal 20px size, where the icon set has one. */
  bold?: boolean;
  /** Makes the icon informative: it becomes an image with this name. Without it the icon is decoration and hidden from screen readers. */
  label?: string;
}>();

const resolve = useIconResolver();
const resolved = computed(() => resolve(props.name as string, !!(props.small || props.bold)));
/** An arrow or chevron that points left or right turns around in a right-to-left page. A physical alignment (`text-align-left`) does not. */
const directional = computed(
  () => typeof props.name === "string" && /(^|[-:])(left|right)(-|$)/.test(props.name) && !/align/.test(props.name),
);
const common = computed(() => ({
  class: ["e-icon", { "e-icon--s": props.small, "e-icon--dir": directional.value }],
  role: props.label ? "img" : undefined,
  "aria-label": props.label || undefined,
  "aria-hidden": props.label ? undefined : (true as const),
}));
</script>

<template>
  <component :is="resolved.component" v-if="resolved.kind === 'component'" v-bind="common" focusable="false" />
  <span v-else-if="resolved.kind === 'svg'" v-bind="common" class="e-icon--svg" v-html="resolved.html" />
  <svg
    v-else-if="resolved.kind === 'glyph'"
    v-bind="common"
    class="e-icon--glyph"
    :viewBox="resolved.viewBox"
    focusable="false"
    v-html="resolved.html"
  />
</template>

<style>
@layer e.primitives {
  .e-icon {
    flex: none;
    width: var(--e-icon-size);
    height: var(--e-icon-size);
  }

  .e-icon--glyph {
    fill: currentcolor;
    stroke: none;
  }

  .e-icon--svg {
    display: inline-flex;
  }

  .e-icon--svg > svg {
    width: 100%;
    height: 100%;
  }

  .e-icon--s {
    width: var(--e-icon-size-sm);
    height: var(--e-icon-size-sm);
  }

  :dir(rtl) .e-icon--dir {
    transform: scaleX(-1);
  }
}
</style>
