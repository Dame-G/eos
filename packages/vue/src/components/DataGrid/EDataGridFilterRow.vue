<script setup lang="ts" generic="Row extends DataGridRow">
import type { CSSProperties } from "vue";
import ESelect from "../Select/ESelect.vue";
import ETextField from "../TextField/ETextField.vue";
import { normalizeOptions, type EOption } from "../Select/options.js";
import { useMessages } from "../../config.js";
import type { DataGridColumn, DataGridFilterValue, DataGridRow } from "./types.js";
import "../../styles/base.css";
import "../TextField/input.css";

/** The row of filters under the headings, one per column that defines a `filter`. */
const props = defineProps<{
  columns: DataGridColumn<Row>[];
  filters: Record<string, DataGridFilterValue>;
  selectable?: boolean;
  /** The inline style of a cell that sticks while scrolling sideways, or nothing for one that scrolls. */
  stickyStyle: (index: number) => CSSProperties | undefined;
  /** The ARIA role of the row and its cells, which the grid sets when it lays rows out as cards. */
  role: (name: string) => string | undefined;
}>();

const emit = defineEmits<{
  filter: [key: string, value: DataGridFilterValue];
}>();

const t = useMessages();
const ALL = "__e-all__";

const numberFilter = (key: string) => {
  const f = props.filters[key];
  return typeof f === "object" ? f : { min: "", max: "" };
};
const textFilter = (key: string) => {
  const f = props.filters[key];
  return typeof f === "string" ? f : "";
};
const selectOptions = (c: DataGridColumn<Row>): EOption[] => [
  { value: ALL, label: t("all") },
  ...normalizeOptions(c.filter?.type === "select" ? c.filter.options : []),
];
</script>

<template>
  <tr class="e-filterrow" :role="role('row')">
    <td v-if="selectable" class="e-cell-check" :role="role('cell')" />
    <td
      v-for="(c, i) in columns"
      :key="c.key"
      :role="role('cell')"
      :class="{ 'e-sticky': !!stickyStyle(i) }"
      :style="stickyStyle(i)"
    >
      <template v-if="c.filter">
        <ESelect
          v-if="c.filter.type === 'select'"
          bare
          :aria-label="t('filterColumn', { col: c.label })"
          :placeholder="t('all')"
          :options="selectOptions(c)"
          :model-value="textFilter(c.key) || ALL"
          @update:model-value="emit('filter', c.key, $event === ALL ? '' : ($event ?? ''))"
        />
        <div v-else-if="c.filter.type === 'number'" class="e-filter-range">
          <ETextField
            hide-label
            inputmode="decimal"
            :label="t('minOf', { col: t('filterColumn', { col: c.label }) })"
            :placeholder="t('min')"
            :model-value="numberFilter(c.key).min"
            @update:model-value="emit('filter', c.key, { min: $event, max: numberFilter(c.key).max })"
          />
          <ETextField
            hide-label
            inputmode="decimal"
            :label="t('maxOf', { col: t('filterColumn', { col: c.label }) })"
            :placeholder="t('max')"
            :model-value="numberFilter(c.key).max"
            @update:model-value="emit('filter', c.key, { min: numberFilter(c.key).min, max: $event })"
          />
        </div>
        <ETextField
          v-else
          hide-label
          type="search"
          :label="t('filterColumn', { col: c.label })"
          :placeholder="t('filter')"
          :model-value="textFilter(c.key)"
          @update:model-value="emit('filter', c.key, $event)"
        />
      </template>
    </td>
  </tr>
</template>
