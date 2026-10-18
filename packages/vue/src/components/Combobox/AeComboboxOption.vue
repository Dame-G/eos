<script setup lang="ts">
import { ComboboxItem } from "reka-ui";
import AeIcon from "../Icon/AeIcon.vue";
import AeHighlight from "./AeHighlight.js";
import type { AeOption } from "../Select/options.js";

defineProps<{
  /** The option to show. */
  option: AeOption;
  /** What the item carries as its value. */
  value: string;
  /** Whether it is chosen: bold, with a check. */
  selected: boolean;
  /** The lower-case text people typed; the first match in the label and description is marked. */
  query: string;
}>();
</script>

<template>
  <ComboboxItem
    :value="value"
    :disabled="option.disabled"
    class="ae-opt"
    :class="{ 'ae-opt--selected': selected, 'ae-opt--disabled': option.disabled }"
    @mousedown.prevent
  >
    <AeIcon v-if="option.icon" :name="option.icon" />
    <span class="ae-opt-text">
      <span class="ae-opt-label"><AeHighlight :text="option.label" :query="query" /></span>
      <span v-if="option.description" class="ae-opt-desc">
        <AeHighlight :text="option.description" :query="query" />
      </span>
    </span>
    <AeIcon v-if="selected" name="check" bold />
  </ComboboxItem>
</template>
