<script setup lang="ts">
import "../../styles/base.css";

defineProps<{
  /** Text shown between two rules. Without it the divider is a plain hairline. It also names the separator for screen readers. Ignored when `vertical`. */
  label?: string;
  /** A vertical rule between items in a row. It stretches to the height of the row. */
  vertical?: boolean;
}>();
</script>

<template>
  <hr v-if="vertical" class="e-divider e-divider--vertical" aria-orientation="vertical" />
  <hr v-else-if="!label" class="e-divider" />
  <!-- A separator's children are presentational, so the name is on the separator and the text is for the eye. -->
  <div v-else class="e-divider-label" role="separator" :aria-label="label">
    <span class="e-kicker" aria-hidden="true">{{ label }}</span>
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

  .e-divider--vertical {
    align-self: stretch;
    inline-size: 0;
    block-size: auto;
    min-block-size: 1em;
    border-block-start: 0;
    border-inline-start: var(--e-stroke-hair) solid var(--e-border);
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
