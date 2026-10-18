<script setup lang="ts">
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** The element to render. */
    as?: string;
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
/* The .e-sr rule is shared and lives in styles/base.css; this empty block only declares the layer. */
/* stylelint-disable-next-line block-no-empty -- the layer declaration is the point */
@layer e.primitives {
}
</style>
