<script setup lang="ts">
import { computed } from "vue";
import { ICON_VIEWBOX, type IconName } from "../../icons/phosphor.js";
import { useIconMarkup } from "../../config.js";
import "../../styles/base.css";

const props = defineProps<{
  /** Icon name from the built-in set, or one added with `createAegis({ icons })`. */
  name: IconName | (string & {});
  /** 14px with the bold weight, for chips and stamps. */
  small?: boolean;
  /** The bold weight at the normal size. */
  bold?: boolean;
}>();

const markup = useIconMarkup();
const html = computed(() => markup(props.name, !!(props.small || props.bold)));
// Arrows and chevrons that point left or right mirror in right-to-left text.
const directional = computed(() => /-(left|right)$/.test(props.name));
</script>

<template>
  <svg
    class="ae-icon"
    :class="{ 'ae-icon--s': small, 'ae-icon--dir': directional }"
    :viewBox="ICON_VIEWBOX"
    aria-hidden="true"
    focusable="false"
    v-html="html"
  />
</template>

<style>
@layer ae.primitives {
  .ae-icon {
    flex: none;
    width: 20px;
    height: 20px;
    fill: currentcolor;
    stroke: none;
  }

  .ae-icon--s {
    width: 14px;
    height: 14px;
  }

  :dir(rtl) .ae-icon--dir {
    transform: scaleX(-1);
  }
}
</style>
