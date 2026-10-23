<script setup lang="ts">
import EFieldFlag from "../Field/EFieldFlag.vue";
import EFieldMessage from "../Field/EFieldMessage.vue";

/** Internal: the row ECheckbox and ESwitch share. The input goes in the default slot, before the text. Not exported. */
defineProps<{
  id: string;
  label: string;
  /** Shown under the label and kept out of its name: the input points at `descId` with aria-describedby. */
  description?: string | undefined;
  descId: string;
  messageId: string;
  bare?: boolean | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  optional?: boolean | undefined;
  hint?: string | undefined;
  error?: string | undefined;
  /** Classes on the label, such as `e-switch`. */
  rowClass?: string | undefined;
}>();
</script>

<template>
  <div class="e-choice-wrap">
    <label class="e-choice" :class="[rowClass, { 'e-choice--bare': bare, 'e-choice--disabled': disabled }]" :for="id">
      <slot />
      <span v-if="bare" class="e-sr">{{ label }}</span>
      <span v-else class="e-choice-text">
        <span class="e-choice-label">
          {{ label }}
          <EFieldFlag :required="required" :optional="optional" />
        </span>
        <!-- Visible under the label, but kept out of its accessible name: the input points at it with aria-describedby. -->
        <span v-if="description" :id="descId" class="e-choice-desc" aria-hidden="true">{{ description }}</span>
      </span>
    </label>
    <EFieldMessage v-if="!bare" :id="messageId" :error="error" :hint="hint" />
  </div>
</template>
