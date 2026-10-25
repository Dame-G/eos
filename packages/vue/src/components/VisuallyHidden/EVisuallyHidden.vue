<script setup lang="ts">
import type { ElementTag } from "../../types.js";
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** The element to render. */
    as?: ElementTag;
  }>(),
  { as: "span" },
);

defineSlots<{
  /** The text that is read out but not shown. */
  default(): unknown;
}>();
</script>

<template>
  <component :is="as" class="e-sr"><slot /></component>
</template>

<style>
/* The clipping rules are the global `.e-sr` class in styles/base.css: use that class on any element, and this component for a slot. The layer declaration below only registers the component's place in the cascade. */
/* stylelint-disable-next-line block-no-empty -- the layer declaration is the point */
@layer e.primitives {
}
</style>
