<script setup lang="ts">
import { computed } from "vue";
import EFieldFlag from "./EFieldFlag.vue";
import EFieldMessage from "./EFieldMessage.vue";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

const props = defineProps<{
  /** The visible label above the control. */
  label: string;
  /** Hides the label from the page and keeps it for screen readers. */
  hideLabel?: boolean;
  /** Help that stays under the control. */
  hint?: string;
  /** What to fix. Replaces the hint, turns the control invalid and is announced. */
  error?: string;
  /** Shows "Required" beside the label. */
  required?: boolean;
  /** Shows "Optional" beside the label. Only the rarer of required and optional needs a flag. */
  optional?: boolean;
  /** The id of the control. The label points at it. @default generated */
  id?: string;
}>();

defineSlots<{
  /** The control. It must carry `id`, `aria-invalid` and `aria-describedby` from the slot scope. `required` says whether to set the `required` attribute on it. */
  default(props: {
    id: string;
    ariaInvalid: "true" | undefined;
    ariaDescribedby: string | undefined;
    required: boolean;
  }): unknown;
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
    <slot
      :id="id"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error || hint ? hintId : undefined"
      :required="!!required"
    />
    <EFieldMessage :id="hintId" :error="error" :hint="hint" />
  </div>
</template>

<style>
@layer e.controls {
  .e-field {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-content: start;
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
