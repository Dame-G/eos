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
  <div class="ae-btngroup" role="group" :aria-label="label">
    <slot />
  </div>
</template>

<style>
@layer ae.composites {
  .ae-btngroup {
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--ae-space-2);
  }
}
</style>
