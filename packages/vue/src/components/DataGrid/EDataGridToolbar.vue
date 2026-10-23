<script setup lang="ts">
import EButton from "../Button/EButton.vue";
import EIcon from "../Icon/EIcon.vue";
import ESelect from "../Select/ESelect.vue";
import EDataGridColumnChooser from "./EDataGridColumnChooser.vue";
import type { EOption } from "../Select/options.js";
import { useMessages } from "../../config.js";
import "../../styles/base.css";
import "../TextField/input.css";

/** The bar above the table: search, the selection count and its actions, the sort menu for cards, and the tools. */
defineProps<{
  searchable?: boolean;
  searchPlaceholder?: string;
  search: string;
  /** How many rows are selected. */
  picked: number;
  /** The sort menu, shown instead of the headings when rows are cards. */
  sortOptions?: EOption[];
  sortValue?: string;
  /** Whether a search or filter is active, which shows Clear filters. */
  filtered?: boolean;
  /** The Columns menu, when given. */
  columns?: { id: string; label: string; visible: boolean }[];
  /** True when nothing but the sort menu is in the bar, so it only shows when rows are cards. */
  sortOnly?: boolean;
}>();

const emit = defineEmits<{
  "update:search": [value: string];
  sort: [value: string];
  clear: [];
  toggleColumn: [id: string, visible: boolean];
}>();

defineSlots<{
  "bulk-actions"?: () => unknown;
  toolbar?: () => unknown;
}>();

const t = useMessages();
</script>

<template>
  <div class="e-grid-bar" :class="{ 'e-grid-bar--sortonly': sortOnly }">
    <div v-if="searchable" class="e-input-wrap e-grid-search">
      <span class="e-affix e-affix--pre"><EIcon name="search" /></span>
      <input
        class="e-input"
        type="search"
        :placeholder="searchPlaceholder || t('searchAll')"
        :aria-label="t('searchAll')"
        :value="search"
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <div v-if="picked" class="e-grid-picked">
      <span class="e-grid-count" aria-hidden="true">{{ t("selected", { n: picked }) }}</span>
      <slot name="bulk-actions" />
    </div>
    <div v-if="sortOptions" class="e-grid-sortsel">
      <ESelect
        bare
        :aria-label="t('sortBy')"
        :placeholder="t('sortBy')"
        :options="sortOptions"
        :model-value="sortValue"
        @update:model-value="emit('sort', $event)"
      />
    </div>
    <div class="e-grid-tools">
      <EButton v-if="filtered" variant="quiet" @click="emit('clear')">{{ t("clearFilters") }}</EButton>
      <EDataGridColumnChooser v-if="columns" :columns="columns" @toggle="(id, v) => emit('toggleColumn', id, v)" />
      <slot name="toolbar" />
    </div>
  </div>
</template>
