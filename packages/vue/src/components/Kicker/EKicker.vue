<script setup lang="ts">
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** The element to render, if it should not be a paragraph. */
    as?: string;
  }>(),
  { as: "p" },
);

defineSlots<{
  /** The label text. */
  default(): unknown;
}>();
</script>

<template>
  <component :is="as" class="e-kicker"><slot /></component>
</template>

<style>
/* The `.e-kicker` rules live in styles/base.css because every field label and chip carries the class without rendering EKicker. */
/* stylelint-disable-next-line block-no-empty -- the layer declaration is the point */
@layer e.primitives {
}
</style>
