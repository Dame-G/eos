<script setup lang="ts">
import "../../styles/base.css";

defineProps<{
  /** Text shown between two rules. Without it the divider is a plain hairline. */
  label?: string;
}>();
</script>

<template>
  <hr v-if="!label" class="e-divider" />
  <div v-else class="e-divider-label" role="separator">
    <span class="e-kicker">{{ label }}</span>
  </div>
</template>

<style>
@layer e.primitives {
  .e-divider {
    height: 0;
    margin: 0;
    border: 0;
    border-top: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-divider-label {
    display: flex;
    align-items: center;
    gap: var(--e-space-3);
  }

  .e-divider-label::before,
  .e-divider-label::after {
    content: "";
    flex: 1;
    border-top: var(--e-stroke-hair) solid var(--e-border);
  }
}
</style>
