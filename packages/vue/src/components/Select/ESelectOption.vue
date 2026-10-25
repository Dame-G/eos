<script setup lang="ts">
import { SelectItem, SelectItemText } from "reka-ui";
import EIcon from "../Icon/EIcon.vue";
import type { EOption } from "./options.js";

defineProps<{
  /** The option to show. */
  option: EOption;
  /** Whether it is the chosen one: bold, with a check. */
  selected: boolean;
}>();
</script>

<template>
  <SelectItem
    :value="option.value"
    :disabled="option.disabled"
    :text-value="option.label"
    class="e-opt e-interact e-interact--inset"
    :class="{ 'e-opt--selected': selected, 'e-opt--disabled': option.disabled }"
  >
    <EIcon v-if="option.icon" :name="option.icon" />
    <SelectItemText class="e-opt-text">
      <span class="e-opt-label">{{ option.label }}</span>
      <span v-if="option.description" class="e-opt-desc">{{ option.description }}</span>
    </SelectItemText>
    <EIcon v-if="selected" name="check" bold />
  </SelectItem>
</template>
