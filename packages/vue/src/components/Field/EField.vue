<script setup lang="ts">
import { computed } from "vue";
import EFieldFlag from "./EFieldFlag.vue";
import EFieldMessage from "./EFieldMessage.vue";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

const props = defineProps<{
  /** The visible label, a small mono kicker above the control. */
  label: string;
  /** Keep the label for screen readers and remove it from the page. */
  hideLabel?: boolean;
  /** Help that stays under the control. */
  hint?: string;
  /** What to fix. Replaces the hint, turns the control invalid and is announced. */
  error?: string;
  /** A word beside the label. */
  required?: boolean;
  /** A word beside the label. Flag whichever is rarer. */
  optional?: boolean;
  /** The id of the control; the label points at it. Generated when left out. */
  id?: string;
}>();

defineSlots<{
  /** The control. Put `id`, `aria-invalid` and `aria-describedby` on it. */
  default(props: { id: string; ariaInvalid: "true" | undefined; ariaDescribedby: string | undefined }): unknown;
}>();

const id = useUid(() => props.id);
const hintId = computed(() => `${id.value}-hint`);
</script>

<template>
  <div class="e-field">
    <label :id="`${id}-label`" class="e-field-label e-kicker" :class="{ 'e-sr': hideLabel }" :for="id">
      {{ label }}
      <EFieldFlag :required="required" :optional="optional" />
    </label>
    <slot :id="id" :aria-invalid="error ? 'true' : undefined" :aria-describedby="error || hint ? hintId : undefined" />
    <EFieldMessage :id="hintId" :error="error" :hint="hint" />
  </div>
</template>

<style>
@layer e.controls {
  .e-field {
    display: grid;
    gap: var(--e-space-2);
    min-width: 0;
  }

  .e-field-label {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--e-space-3);
  }
}
</style>
