<script setup lang="ts">
import { SelectItem, SelectItemText } from "reka-ui";
import AeIcon from "../Icon/AeIcon.vue";
import type { AeOption } from "./options.js";

defineProps<{
  /** The option to show. */
  option: AeOption;
  /** Whether it is the chosen one: bold, with a check. */
  selected: boolean;
}>();
</script>

<template>
  <SelectItem
    :value="option.value"
    :disabled="option.disabled"
    :text-value="option.label"
    class="ae-opt"
    :class="{ 'ae-opt--selected': selected, 'ae-opt--disabled': option.disabled }"
  >
    <AeIcon v-if="option.icon" :name="option.icon" />
    <SelectItemText class="ae-opt-text">
      <span class="ae-opt-label">{{ option.label }}</span>
      <span v-if="option.description" class="ae-opt-desc">{{ option.description }}</span>
    </SelectItemText>
    <AeIcon v-if="selected" name="check" bold />
  </SelectItem>
</template>
