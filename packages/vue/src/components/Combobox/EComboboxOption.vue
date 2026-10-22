<script setup lang="ts">
import { ComboboxItem } from "reka-ui";
import EIcon from "../Icon/EIcon.vue";
import EMatchHighlight from "./matchHighlight.js";
import type { EOption } from "../Select/options.js";

defineProps<{
  /** The option to show. */
  option: EOption;
  /** What the item carries as its value. */
  value: string;
  /** Whether it is chosen. */
  selected: boolean;
  /** The lower-case text people typed. The first match in the label and description is marked. */
  query: string;
}>();
</script>

<template>
  <ComboboxItem
    :value="value"
    :disabled="option.disabled"
    class="e-opt"
    :class="{ 'e-opt--selected': selected, 'e-opt--disabled': option.disabled }"
    @mousedown.prevent
  >
    <EIcon v-if="option.icon" :name="option.icon" />
    <span class="e-opt-text">
      <span class="e-opt-label"><EMatchHighlight :text="option.label" :query="query" /></span>
      <span v-if="option.description" class="e-opt-desc">
        <EMatchHighlight :text="option.description" :query="query" />
      </span>
    </span>
    <EIcon v-if="selected" name="check" bold />
  </ComboboxItem>
</template>
