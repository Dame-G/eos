<script setup lang="ts">
import AeIcon from "../Icon/AeIcon.vue";

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
  <p v-if="error" :id="id" class="ae-field-error" role="alert">
    <AeIcon name="alert" />
    {{ error }}
  </p>
  <p v-else-if="hint" :id="id" class="ae-field-hint">{{ hint }}</p>
</template>

<style>
@layer ae.controls {
  .ae-field-hint {
    font: 400 var(--ae-text-sm)/1.4 var(--ae-font-sans);
    color: var(--ae-muted);
    margin: 0;
  }

  .ae-field-error {
    display: flex;
    align-items: flex-start;
    gap: var(--ae-space-1);
    font: 500 var(--ae-text-sm)/1.4 var(--ae-font-sans);
    color: var(--ae-danger);
    margin: 0;
  }

  .ae-field-error .ae-icon {
    width: 16px;
    height: 16px;
    margin-top: 2px;
  }
}
</style>
