<script setup lang="ts">
import { useMessages } from "../../config.js";

defineProps<{
  /** Shows the word "Required". */
  required?: boolean;
  /** Shows the word "Optional". Only the rarer of required and optional needs a flag. */
  optional?: boolean;
}>();

const t = useMessages();
</script>

<template>
  <span v-if="required || optional" class="e-field-flag">{{ required ? t("required") : t("optional") }}</span>
</template>

<style>
@layer e.controls {
  .e-field-flag {
    font: var(--e-weight-regular) var(--e-text-sm)/1.2 var(--e-font-sans);
    letter-spacing: 0;
    text-transform: none;
    color: var(--e-muted);
  }
}
</style>
