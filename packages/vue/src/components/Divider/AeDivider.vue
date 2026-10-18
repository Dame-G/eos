<script setup lang="ts">
import "../../styles/base.css";

defineProps<{
  /** Text set in a mono kicker between two rules. Without it the divider is a plain hairline. */
  label?: string;
}>();
</script>

<template>
  <hr v-if="!label" class="ae-divider" />
  <div v-else class="ae-divider-label" role="separator">
    <span class="ae-kicker">{{ label }}</span>
  </div>
</template>

<style>
@layer ae.primitives {
  .ae-divider {
    height: 0;
    margin: 0;
    border: 0;
    border-top: var(--ae-stroke-hair) solid var(--ae-border);
  }

  .ae-divider-label {
    display: flex;
    align-items: center;
    gap: var(--ae-space-3);
  }

  .ae-divider-label::before,
  .ae-divider-label::after {
    content: "";
    flex: 1;
    border-top: var(--ae-stroke-hair) solid var(--ae-border);
  }
}
</style>
