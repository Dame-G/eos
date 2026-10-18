<script setup lang="ts">
import "../../styles/base.css";

defineProps<{
  /** What the group is for. Read by screen readers as the name of the group. */
  label: string;
}>();

defineSlots<{
  /** The buttons. */
  default(): unknown;
}>();
</script>

<template>
  <div class="e-btngroup" role="group" :aria-label="label">
    <slot />
  </div>
</template>

<style>
@layer e.composites {
  .e-btngroup {
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--e-space-2);
  }
}
</style>
