<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";

defineProps<{
  /** The id that `aria-describedby` points at. */
  id: string;
  /** What to fix. Replaces the hint, is announced (`role="alert"`) and carries an alert glyph. */
  error?: string | undefined;
  /** Help that stays under the control. */
  hint?: string | undefined;
}>();
</script>

<template>
  <p v-if="error" :id="id" class="e-field-error" role="alert">
    <EIcon name="alert" />
    {{ error }}
  </p>
  <p v-else-if="hint" :id="id" class="e-field-hint">{{ hint }}</p>
</template>

<style>
@layer e.controls {
  .e-field-hint {
    font: var(--e-weight-regular) var(--e-text-sm)/1.4 var(--e-font-sans);
    color: var(--e-muted);
    margin: 0;
  }

  .e-field-error {
    display: flex;
    align-items: flex-start;
    gap: var(--e-gap-tight);
    font: var(--e-weight-medium) var(--e-text-sm)/1.4 var(--e-font-sans);
    color: var(--e-danger);
    margin: 0;
  }

  .e-field-error .e-icon {
    width: var(--e-icon-size-sm);
    height: var(--e-icon-size-sm);
    margin-block-start: var(--e-stroke-focus);
  }
}
</style>
