<script setup lang="ts">
import { useMessages } from "../../config.js";

defineProps<{
  /** Show the word "Required". */
  required?: boolean;
  /** Show the word "Optional". Flag whichever is rarer. */
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
    font: 400 var(--e-text-sm)/1.2 var(--e-font-sans);
    letter-spacing: 0;
    text-transform: none;
    color: var(--e-muted);
  }
}
</style>
