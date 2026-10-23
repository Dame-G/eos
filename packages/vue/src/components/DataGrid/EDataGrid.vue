<script setup lang="ts" generic="Row extends DataGridRow">
import { computed, onBeforeUnmount, onMounted, ref, watch, type CSSProperties } from "vue";
import { PopoverClose, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from "reka-ui";
import {
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  functionalUpdate,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type FilterFn,
  type RowSelectionState,
  type SortFn,
} from "@tanstack/vue-table";
import { useVirtualizer } from "@tanstack/vue-virtual";
import EButton from "../Button/EButton.vue";
import ECheckbox from "../Checkbox/ECheckbox.vue";
import EEmptyState from "../EmptyState/EEmptyState.vue";
import EIcon from "../Icon/EIcon.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import EPagination from "../Pagination/EPagination.vue";
import "../Skeleton/ESkeleton.vue";
import ESelect from "../Select/ESelect.vue";
import ETextField from "../TextField/ETextField.vue";
import EDataGridResizer from "./EDataGridResizer.vue";
import "../Definition/EDefinition.vue";
import { normalizeOptions, type EOption } from "../Select/options.js";
import type { IconProp } from "../../icons/types.js";
import { useMessages, usePortalTarget } from "../../config.js";
import { useLocale } from "../../composables/useLocale.js";
import { cellValue, compareValues, filterActive, foldText, parsePx, passesFilter } from "./grid.js";
import type {
  DataGridColumn,
  DataGridFilterValue,
  DataGridQuery,
  DataGridRow,
  DataGridSort,
  DataGridVirtual,
} from "./types.js";
import "../../styles/base.css";
import "../Table/table.css";
import "../TextField/input.css";
import "../Select/panel.css";

const props = withDefaults(
  defineProps<{
    /** The columns, in order. See `DataGridColumn` below. */
    columns: DataGridColumn<Row>[];
    /** The rows. Each needs a unique `id`, and selection is by id. */
    rows: Row[];
    /** Names the table for screen readers, and its scrolling region. */
    caption: string;
    /** One search box over all shown columns. */
    searchable?: boolean;
    /** The search box's placeholder. @default "Search all columns" */
    searchPlaceholder?: string;
    /** Shows a filter row under the headings, for columns that define a `filter`. */
    filterable?: boolean;
    /** Lets people drag column edges, or move them with the arrow keys. */
    resizable?: boolean;
    /** Keeps the first column in view while scrolling sideways. */
    stickyFirst?: boolean;
    /** Shows a Columns menu to show and hide columns. */
    columnToggle?: boolean;
    /** Shows a checkbox on each row and a select-all in the heading. */
    selectable?: boolean;
    /** Rows per page. 0 turns paging off. */
    pageSize?: number;
    /** Stops the table growing past this height (any CSS length) and scrolls inside it, with a sticky header. */
    maxHeight?: string;
    /** Renders only the rows in view, for thousands of rows. Replaces paging. `true` or `{ rowHeight = 48, height = 440, overscan = 8 }`. */
    virtual?: boolean | DataGridVirtual;
    /** Turns rows into cards below 40rem of the grid's own width. `virtual` and `resizable` grids keep the table. */
    cards?: boolean;
    /** Marks the data as living on a server. The grid shows the rows given, in the order given, and reports every change through `queryChange`, once on mount too, so the first fetch needs no code of its own. */
    manual?: boolean;
    /** With `manual`, how many milliseconds to wait after the last keystroke in the search box before `queryChange`. Other changes report at once. */
    searchDebounce?: number;
    /** With `manual`, how many rows there are in all. */
    total?: number;
    /** Shows placeholder rows while data loads, with `aria-busy`. */
    loading?: boolean;
    /** How many placeholder rows `loading` shows. */
    skeletonRows?: number;
    /** The title when there are no rows. @default "No results" */
    emptyTitle?: string;
    /** The sentence under the empty title, when there are no rows. */
    emptyText?: string;
    /** The icon above the empty title. @default "search" */
    emptyIcon?: IconProp;
    /** Renders a bare table for a short static list, with no toolbar, filters, paging or footer. */
    bare?: boolean;
  }>(),
  { pageSize: 10, cards: true, searchDebounce: 0, skeletonRows: 5 },
);

const emit = defineEmits<{
  /** Sort, page, search or filters changed. With `manual`, fetch the rows this describes. */
  queryChange: [query: DataGridQuery];
}>();

const slots = defineSlots<{
  [K: `cell-${string}`]: (props: { row: Row; value: unknown }) => unknown;
  [K: `header-${string}`]: (props: { column: DataGridColumn<Row> }) => unknown;
  /** Buttons that act on the selected rows, shown beside the count. */
  "bulk-actions"?: () => unknown;
  /** Anything else for the bar above the table. */
  toolbar?: () => unknown;
}>();

/** The sort: `{ key, dir: "asc" | "desc" }`, or `null` for none. */
const sort = defineModel<DataGridSort | null>("sort", { default: null });
/** The current page, from 1. */
const page = defineModel<number>("page", { default: 1 });
/** The text in the search box. */
const search = defineModel<string>("search", { default: "" });
/** The column filters, by column `key`: text, or `{ min, max }` strings for `number`. */
const filters = defineModel<Record<string, DataGridFilterValue>>("filters", { default: () => ({}) });
/** The selected row ids, as they are on the rows (numbers stay numbers), kept across pages and filters. */
const selected = defineModel<Row["id"][]>("selected", { default: () => [] });

const t = useMessages();
const loc = useLocale();
const portal = usePortalTarget();

const menuOpen = ref(false);

const ALL = "__e-all__";
const NONE = "__e-none__";

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature,
  columnVisibilityFeature,
  columnSizingFeature,
});

const columnVisibility = ref<Record<string, boolean>>({});
const columnSizing = ref<Record<string, number>>({});

const sortFn: SortFn<typeof features, Row> = (a, b, id) =>
  compareValues(a.getValue(id), b.getValue(id), loc.locale.value);
type GlobalFilter = { q: string; cols: string[] };
const globalFilterFn: FilterFn<typeof features, Row> = (row, id, f: GlobalFilter) => {
  if (!f.cols.includes(id)) return false;
  const v = row.getValue(id);
  const col = colByKey.value.get(id);
  return v != null && (foldText(v).includes(f.q) || (!!col && foldText(show(row.original, col)).includes(f.q)));
};

const colByKey = computed(() => new Map(props.columns.map((c) => [c.key, c])));

// What a default cell writes: a column's `format`, else a date or a figure in the configured locale.
const numberFormat = computed(() => {
  try {
    return new Intl.NumberFormat(loc.locale.value);
  } catch {
    return new Intl.NumberFormat();
  }
});
function show(row: Row, c: DataGridColumn<Row>): string {
  const v = cellValue(row, c);
  if (v == null) return "";
  const f = c.format;
  if (typeof f === "function") return f(v, row);
  const isNumber = typeof v === "number" && Number.isFinite(v);
  if (f === "date" || (!f && v instanceof Date))
    return v instanceof Date || typeof v === "string" ? fmtDate(v) : String(v);
  if (f === "currency") return isNumber ? loc.formatMoney(v) : String(v);
  if (f === "number" || (!f && c.numeric && isNumber)) return isNumber ? numberFormat.value.format(v) : String(v);
  return String(v);
}
function fmtDate(v: Date | string): string {
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : loc.formatDate(d);
}
const columnDefs = computed<ColumnDef<typeof features, Row>[]>(() =>
  props.columns.map((c) => ({
    id: c.key,
    accessorFn: (row: Row) => cellValue(row, c),
    header: c.label,
    enableSorting: !!c.sortable,
    sortDescFirst: false,
    sortFn,
    enableColumnFilter: !!c.filter,
    filterFn: ((row, id, f) => passesFilter(c, row.getValue(id), f, show(row.original, c))) as FilterFn<
      typeof features,
      Row
    >,
    enableResizing: c.resizable !== false,
  })),
);

const vopt = computed(() =>
  props.virtual ? { rowHeight: 48, height: 440, overscan: 8, ...(props.virtual === true ? {} : props.virtual) } : null,
);
const pageSize = computed(() => (vopt.value || props.bare ? 0 : (props.pageSize ?? 10)));
const paging = computed(() => pageSize.value > 0 && !props.manual);
const resizable = computed(() => !!props.resizable && !props.bare);
const cards = computed(() => props.cards !== false && !vopt.value && !resizable.value);
const q = computed(() => foldText(search.value.trim()));
const anyFilter = computed(() => Object.values(filters.value).some(filterActive));

// TanStack keys selection by string. The model holds the ids as the rows have them.
const idByKey = computed(() => new Map(props.rows.map((r) => [String(r.id), r.id as Row["id"]])));
const selectionKeys = computed<RowSelectionState>(() =>
  Object.fromEntries(selected.value.map((id) => [String(id), true])),
);
const toId = (key: string): Row["id"] =>
  idByKey.value.get(key) ?? selected.value.find((id) => String(id) === key) ?? key;

const table = useTable({
  features,
  columns: columnDefs,
  data: computed(() => props.rows),
  getRowId: (row: Row) => String(row.id),
  enableMultiSort: false,
  enableSubRowSelection: false,
  // The default asks only columns whose first value is a string or a number; a date cell is searched too.
  getColumnCanGlobalFilter: () => true,
  autoResetPageIndex: false,
  manualSorting: computed(() => !!props.manual),
  manualFiltering: computed(() => !!props.manual),
  manualPagination: computed(() => !paging.value),
  rowCount: computed(() => (props.manual ? (props.total ?? props.rows.length) : undefined)),
  globalFilterFn,
  state: computed(() => ({
    sorting: sort.value ? [{ id: sort.value.key, desc: sort.value.dir === "desc" }] : [],
    columnFilters: Object.entries(filters.value)
      .filter(([key, value]) => colByKey.value.has(key) && filterActive(value))
      .map(([id, value]) => ({ id, value })),
    globalFilter: q.value
      ? ({
          q: q.value,
          cols: props.columns.filter((c) => columnVisibility.value[c.key] !== false).map((c) => c.key),
        } satisfies GlobalFilter)
      : undefined,
    rowSelection: selectionKeys.value,
    columnVisibility: columnVisibility.value,
    columnSizing: columnSizing.value,
    pagination: { pageIndex: Math.max(0, page.value - 1), pageSize: pageSize.value || 1 },
  })),
  onSortingChange: (updater) => {
    const next = functionalUpdate(updater, sort.value ? [{ id: sort.value.key, desc: sort.value.dir === "desc" }] : []);
    const first = next[0];
    sort.value = first ? { key: first.id, dir: first.desc ? "desc" : "asc" } : null;
    page.value = 1;
  },
  onRowSelectionChange: (updater) => {
    const next = functionalUpdate(updater, selectionKeys.value);
    selected.value = Object.keys(next)
      .filter((k) => next[k])
      .map(toId);
  },
  onColumnVisibilityChange: (updater) => {
    columnVisibility.value = functionalUpdate(updater, columnVisibility.value);
  },
  onColumnSizingChange: (updater) => {
    columnSizing.value = functionalUpdate(updater, columnSizing.value);
  },
});

const view = computed(() => table.getRowModel().rows);
const total = computed(() =>
  props.manual ? (props.total ?? props.rows.length) : table.getPrePaginatedRowModel().rows.length,
);
const pages = computed(() => (pageSize.value > 0 ? Math.max(1, Math.ceil(total.value / pageSize.value)) : 1));
const cur = computed(() => Math.min(page.value, pages.value));
watch(pages, (n) => {
  if (page.value > n) page.value = n;
});
const cols = computed(() =>
  table
    .getVisibleLeafColumns()
    .map((c) => colByKey.value.get(c.id))
    .filter((c): c is DataGridColumn<Row> => !!c),
);
const hasFilterRow = computed(() => !!props.filterable && !props.bare && cols.value.some((c) => c.filter));
const colCount = computed(() => cols.value.length + (props.selectable ? 1 : 0));
const from = computed(() =>
  total.value === 0 ? 0 : (cur.value - 1) * (pageSize.value > 0 ? pageSize.value : total.value) + 1,
);
const to = computed(() => (pageSize.value > 0 ? Math.min(total.value, cur.value * pageSize.value) : total.value));
const sortedCol = computed(() => (sort.value ? colByKey.value.get(sort.value.key) : undefined));
const nPicked = computed(() => selected.value.length);
const allOn = computed(() => view.value.length > 0 && view.value.every((r) => r.getIsSelected()));
const someOn = computed(() => view.value.some((r) => r.getIsSelected()));

const scrollEl = ref<HTMLElement | null>(null);
const virtualizer = useVirtualizer(
  computed(() => ({
    count: vopt.value ? view.value.length : 0,
    getScrollElement: () => scrollEl.value,
    estimateSize: () => vopt.value?.rowHeight ?? 48,
    overscan: vopt.value?.overscan ?? 8,
    getItemKey: (i: number) => view.value[i]?.id ?? i,
    initialRect: { width: 0, height: vopt.value?.height ?? 0 },
  })),
);
const items = computed(() => (vopt.value ? virtualizer.value.getVirtualItems() : []));
const shown = computed(() => (vopt.value ? items.value.flatMap((i) => (view.value[i.index] ? [i] : [])) : []));
const spaceTop = computed(() => items.value[0]?.start ?? 0);
const spaceBottom = computed(() => {
  const last = items.value[items.value.length - 1];
  return last ? Math.max(0, virtualizer.value.getTotalSize() - last.end) : 0;
});
const rowsToRender = computed(() =>
  vopt.value
    ? shown.value.map((i) => ({ row: view.value[i.index]!, index: i.index }))
    : view.value.map((row, index) => ({ row, index })),
);

const cellProps = (row: (typeof view.value)[number], c: DataGridColumn<Row>) => ({
  row: row.original,
  value: row.getValue(c.key),
});

const fixedLayout = computed(() => resizable.value || !!vopt.value || cols.value.some((c) => c.width));
const widthOf = (c: DataGridColumn<Row>) => columnSizing.value[c.key] || parsePx(c.width) || undefined;
const maxOf = (c: DataGridColumn<Row>) => c.maxWidth ?? Math.max(960, (parsePx(c.width) ?? 0) * 2);
// The checkbox column is as wide as its box (which grows with the text size) plus its padding.
const minTable = computed(
  () =>
    `calc(${props.selectable ? "var(--_check-w)" : "0px"} + ${cols.value.reduce((s, c) => s + (widthOf(c) || c.minWidth || 96), 0)}px)`,
);
const stick = (i: number) => !!props.stickyFirst && i === 0;
const stickStyle = (i: number): CSSProperties | undefined =>
  stick(i) ? { insetInlineStart: props.selectable ? "var(--_check-w)" : "0px" } : undefined;
const tableStyle = computed(
  () =>
    ({
      "--_min-w": fixedLayout.value ? minTable.value : undefined,
      "--_row-h": vopt.value ? `${vopt.value.rowHeight}px` : undefined,
    }) as CSSProperties,
);
// The filter row sticks under the heading row, whatever height the text size gives it.
const headRow = ref<HTMLElement | null>(null);
const headH = ref<number | undefined>(undefined);
let headObserver: ResizeObserver | undefined;
onMounted(() => {
  if (typeof ResizeObserver === "undefined" || !headRow.value) return;
  headObserver = new ResizeObserver(() => (headH.value = headRow.value?.getBoundingClientRect().height));
  headObserver.observe(headRow.value);
});
onBeforeUnmount(() => {
  headObserver?.disconnect();
  clearTimeout(queryTimer);
});
const scrollStyle = computed(
  () =>
    ({
      height: vopt.value ? `${vopt.value.height}px` : undefined,
      "--_max-h": !vopt.value && props.maxHeight ? props.maxHeight : undefined,
      "--_head-h": headH.value ? `${headH.value}px` : undefined,
    }) as CSSProperties,
);
const role = (r: string) => (cards.value ? r : undefined);

const sortables = computed(() => props.columns.filter((c) => c.sortable));
const sortOptions = computed<EOption[]>(() => [
  { value: NONE, label: t("sortBy") },
  ...sortables.value.flatMap((c) =>
    (["asc", "desc"] as const).map((d) => ({
      value: `${c.key}:${d}`,
      label: `${c.label}, ${t(d === "asc" ? "ascending" : "descending")}`,
    })),
  ),
]);
const sortSelectValue = computed(() => (sort.value ? `${sort.value.key}:${sort.value.dir}` : NONE));
const showSortSelect = computed(() => cards.value && sortables.value.length > 0);
const hasToolbar = computed(() => !!slots.toolbar);
const barOther = computed(
  () => !!props.searchable || !!props.columnToggle || nPicked.value > 0 || anyFilter.value || hasToolbar.value,
);
const showBar = computed(() => !props.bare && (barOther.value || showSortSelect.value));

function onSearch(e: Event) {
  search.value = (e.target as HTMLInputElement).value;
  page.value = 1;
}
function setFilter(key: string, value: DataGridFilterValue) {
  filters.value = { ...filters.value, [key]: value };
  page.value = 1;
}
function clearFilters() {
  filters.value = {};
  search.value = "";
  page.value = 1;
}
function chooseSort(v: string) {
  if (v === NONE) sort.value = null;
  else {
    const at = v.lastIndexOf(":");
    sort.value = { key: v.slice(0, at), dir: v.slice(at + 1) === "desc" ? "desc" : "asc" };
  }
  page.value = 1;
}
function setWidth(key: string, px: number) {
  table.setColumnSizing((old) => ({ ...old, [key]: px }));
}
function resetWidth(key: string) {
  table.setColumnSizing((old) => {
    const next = { ...old };
    delete next[key];
    return next;
  });
}
const numberFilter = (key: string) => {
  const f = filters.value[key];
  return typeof f === "object" ? f : { min: "", max: "" };
};
const textFilter = (key: string) => {
  const f = filters.value[key];
  return typeof f === "string" ? f : "";
};
const selectOptions = (c: DataGridColumn<Row>): EOption[] => [
  { value: ALL, label: t("all") },
  ...normalizeOptions(c.filter?.type === "select" ? c.filter.options : []),
];

let queryTimer: ReturnType<typeof setTimeout> | undefined;
let reportedSearch = search.value;
function report() {
  clearTimeout(queryTimer);
  reportedSearch = search.value;
  emit("queryChange", {
    sort: sort.value,
    page: page.value,
    pageSize: pageSize.value,
    search: search.value,
    filters: filters.value,
  });
}
watch([sort, page, search, filters], () => {
  // Typing in the search box waits for a pause; a click on a heading or a page goes at once.
  if (props.manual && props.searchDebounce > 0 && search.value !== reportedSearch) {
    clearTimeout(queryTimer);
    queryTimer = setTimeout(report, props.searchDebounce);
  } else report();
});
onMounted(() => {
  if (props.manual) report();
});
</script>

<template>
  <div class="e-grid" :class="{ 'e-grid--bare': bare, 'e-grid--cards': cards }">
    <div class="e-grid-frame">
      <div v-if="showBar" class="e-grid-bar" :class="{ 'e-grid-bar--sortonly': !barOther }">
        <div v-if="searchable" class="e-input-wrap e-grid-search">
          <span class="e-affix e-affix--pre"><EIcon name="search" /></span>
          <input
            class="e-input"
            type="search"
            :placeholder="searchPlaceholder || t('searchAll')"
            :aria-label="t('searchAll')"
            :value="search"
            @input="onSearch"
          />
        </div>
        <div v-if="nPicked" class="e-grid-picked">
          <span class="e-grid-count">{{ t("selected", { n: nPicked }) }}</span>
          <slot name="bulk-actions" />
        </div>
        <div v-if="showSortSelect" class="e-grid-sortsel">
          <ESelect
            bare
            :aria-label="t('sortBy')"
            :placeholder="t('sortBy')"
            :options="sortOptions"
            :model-value="sortSelectValue"
            @update:model-value="chooseSort"
          />
        </div>
        <div class="e-grid-tools">
          <EButton v-if="anyFilter || q" variant="quiet" @click="clearFilters">{{ t("clearFilters") }}</EButton>
          <PopoverRoot v-if="columnToggle" v-model:open="menuOpen">
            <PopoverTrigger as-child>
              <EButton variant="outline" :aria-label="t('chooseColumns')">{{ t("columns") }}</EButton>
            </PopoverTrigger>
            <PopoverPortal :to="portal">
              <PopoverContent
                class="e-popover e-root"
                side="bottom"
                align="start"
                :side-offset="8"
                :collision-padding="16"
              >
                <header class="e-pop-head">
                  <h3 class="e-pop-title">{{ t("showColumns") }}</h3>
                  <PopoverClose as-child>
                    <EIconButton icon="x" :label="t('close')" />
                  </PopoverClose>
                </header>
                <div class="e-pop-body">
                  <ECheckbox
                    v-for="column in table.getAllLeafColumns()"
                    :key="column.id"
                    :label="colByKey.get(column.id)?.label ?? column.id"
                    :model-value="column.getIsVisible()"
                    @update:model-value="column.toggleVisibility($event)"
                  />
                </div>
              </PopoverContent>
            </PopoverPortal>
          </PopoverRoot>
          <slot name="toolbar" />
        </div>
      </div>
      <div ref="scrollEl" class="e-grid-scroll" :style="scrollStyle" tabindex="0" role="region" :aria-label="caption">
        <table
          class="e-table e-gridtable"
          :class="{ 'e-gridtable--virtual': vopt, 'e-gridtable--fixed': fixedLayout }"
          :style="tableStyle"
          :role="role('table')"
          :aria-busy="loading ? 'true' : undefined"
          :aria-rowcount="vopt ? total + 1 + (hasFilterRow ? 1 : 0) : undefined"
        >
          <caption class="e-sr">
            {{
              caption
            }}
          </caption>
          <colgroup v-if="fixedLayout">
            <col v-if="selectable" style="width: var(--_check-w)" />
            <col v-for="c in cols" :key="c.key" :style="widthOf(c) ? { width: `${widthOf(c)}px` } : undefined" />
          </colgroup>
          <thead :role="role('rowgroup')">
            <tr ref="headRow" :role="role('row')">
              <th v-if="selectable" scope="col" class="e-cell-check" :role="role('columnheader')">
                <ECheckbox
                  bare
                  :label="vopt ? t('selectAll') : t('selectAllPage')"
                  :model-value="allOn"
                  :indeterminate="someOn && !allOn"
                  @update:model-value="table.toggleAllPageRowsSelected(!allOn)"
                />
              </th>
              <th
                v-for="(c, i) in cols"
                :key="c.key"
                scope="col"
                :role="role('columnheader')"
                :class="{ 'e-num': c.numeric, 'e-center': c.align === 'center', 'e-sticky': stick(i) }"
                :style="stickStyle(i)"
                :aria-sort="
                  c.sortable
                    ? sort?.key === c.key
                      ? sort.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                    : undefined
                "
              >
                <button
                  v-if="c.sortable"
                  type="button"
                  class="e-sortbtn"
                  @click="table.getColumn(c.key)?.toggleSorting()"
                >
                  <slot :name="`header-${c.key}`" :column="c">{{ c.label }}</slot>
                  <EIcon
                    :name="sort?.key === c.key ? (sort.dir === 'asc' ? 'arrow-up' : 'arrow-down') : 'sort'"
                    small
                  />
                </button>
                <slot v-else :name="`header-${c.key}`" :column="c">{{ c.label }}</slot>
                <EDataGridResizer
                  v-if="resizable && c.resizable !== false"
                  :label="c.label"
                  :width="widthOf(c)"
                  :min="c.minWidth || 72"
                  :max="maxOf(c)"
                  @resize="setWidth(c.key, $event)"
                  @reset="resetWidth(c.key)"
                />
              </th>
            </tr>
            <tr v-if="hasFilterRow" class="e-filterrow" :role="role('row')">
              <td v-if="selectable" class="e-cell-check" :role="role('cell')" />
              <td
                v-for="(c, i) in cols"
                :key="c.key"
                :role="role('cell')"
                :class="{ 'e-sticky': stick(i) }"
                :style="stickStyle(i)"
              >
                <template v-if="c.filter">
                  <ESelect
                    v-if="c.filter.type === 'select'"
                    bare
                    :aria-label="t('filterColumn', { col: c.label })"
                    :placeholder="t('all')"
                    :options="selectOptions(c)"
                    :model-value="textFilter(c.key) || ALL"
                    @update:model-value="setFilter(c.key, $event === ALL ? '' : $event)"
                  />
                  <div v-else-if="c.filter.type === 'number'" class="e-filter-range">
                    <ETextField
                      hide-label
                      inputmode="decimal"
                      :label="t('minOf', { col: t('filterColumn', { col: c.label }) })"
                      :placeholder="t('min')"
                      :model-value="numberFilter(c.key).min"
                      @update:model-value="setFilter(c.key, { min: $event, max: numberFilter(c.key).max })"
                    />
                    <ETextField
                      hide-label
                      inputmode="decimal"
                      :label="t('maxOf', { col: t('filterColumn', { col: c.label }) })"
                      :placeholder="t('max')"
                      :model-value="numberFilter(c.key).max"
                      @update:model-value="setFilter(c.key, { min: numberFilter(c.key).min, max: $event })"
                    />
                  </div>
                  <ETextField
                    v-else
                    hide-label
                    type="search"
                    :label="t('filterColumn', { col: c.label })"
                    :placeholder="t('filter')"
                    :model-value="textFilter(c.key)"
                    @update:model-value="setFilter(c.key, $event)"
                  />
                </template>
              </td>
            </tr>
          </thead>
          <tbody :role="role('rowgroup')">
            <template v-if="loading">
              <tr v-for="n in skeletonRows" :key="`s${n}`" :role="role('row')">
                <td v-if="selectable" class="e-cell-check" :role="role('cell')" />
                <td v-for="c in cols" :key="c.key" :role="role('cell')"><span class="e-skel" /></td>
              </tr>
            </template>
            <tr v-else-if="view.length === 0" :role="role('row')">
              <td :colspan="colCount" class="e-grid-empty" :role="role('cell')">
                <EEmptyState bare :icon="emptyIcon || 'search'" :title="emptyTitle || t('noResults')">
                  {{ emptyText || (anyFilter || q ? t("noMatchesFilters") : t("nothingYet")) }}
                  <template v-if="anyFilter || q" #action>
                    <EButton variant="outline" @click="clearFilters">{{ t("clearFilters") }}</EButton>
                  </template>
                </EEmptyState>
              </td>
            </tr>
            <template v-else>
              <tr v-if="vopt && spaceTop > 0" aria-hidden="true" class="e-spacer" :style="{ height: `${spaceTop}px` }">
                <td :colspan="colCount" />
              </tr>
              <tr
                v-for="{ row, index } in rowsToRender"
                :key="row.id"
                :role="role('row')"
                :data-selected="row.getIsSelected() ? '' : undefined"
                :aria-rowindex="vopt ? index + 2 + (hasFilterRow ? 1 : 0) : undefined"
              >
                <td v-if="selectable" class="e-cell-check" :role="role('cell')">
                  <ECheckbox
                    bare
                    :label="t('selectRow')"
                    :model-value="row.getIsSelected()"
                    @update:model-value="row.toggleSelected($event)"
                  />
                </td>
                <td
                  v-for="(c, i) in cols"
                  :key="c.key"
                  :role="role('cell')"
                  :data-label="c.label"
                  :class="{ 'e-num': c.numeric, 'e-center': c.align === 'center', 'e-sticky': stick(i) }"
                  :style="stickStyle(i)"
                >
                  <slot :name="`cell-${c.key}`" v-bind="cellProps(row, c)">{{ show(row.original, c) }}</slot>
                </td>
              </tr>
              <tr
                v-if="vopt && spaceBottom > 0"
                aria-hidden="true"
                class="e-spacer"
                :style="{ height: `${spaceBottom}px` }"
              >
                <td :colspan="colCount" />
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <div v-if="!bare" class="e-grid-foot">
        <span class="e-grid-range">{{
          total === 0
            ? t("rows", { n: 0 })
            : vopt || pageSize === 0
              ? t("rows", { n: total })
              : t("showing", { from, to, total })
        }}</span>
        <EPagination
          v-if="pageSize > 0 && pages > 1"
          :model-value="cur"
          :page-count="pages"
          :label="`${t('pagination')}: ${caption}`"
          @update:model-value="page = $event"
        />
      </div>
      <span class="e-sr" role="status">{{
        loading
          ? t("loading")
          : (sortedCol
              ? t("sortedBy", { col: sortedCol.label, dir: t(sort?.dir === "asc" ? "ascending" : "descending") }) + " "
              : "") + t("rowsAnnounce", { n: total })
      }}</span>
    </div>
  </div>
</template>

<style>
@layer e.containers {
  .e-grid {
    --_check-w: calc(var(--e-check-size) + var(--e-space-4) + var(--e-space-3));
    --_head-h: var(--e-control-height);

    isolation: isolate;
    border-radius: var(--e-radius-md);
    min-width: 0;
  }

  .e-grid-frame::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: var(--e-z-sticky);
    border-radius: inherit;
    box-shadow: inset 0 0 0 var(--e-stroke-card) var(--e-border-strong);
    pointer-events: none;
  }

  .e-grid-frame {
    position: relative;
    overflow: hidden;
    border-radius: inherit;
    background: var(--e-surface);
  }

  .e-grid-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--e-space-3);
    padding: var(--e-space-3) var(--e-space-4);
    border-bottom: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-grid-search {
    flex: 1 1 10rem;
    max-width: 24rem;
  }

  .e-grid-search .e-input {
    padding-inline-start: var(--e-space-2);
  }

  .e-grid-picked {
    display: flex;
    align-items: center;
    gap: var(--e-space-3);
  }

  .e-grid-count {
    font: var(--e-weight-strong) var(--e-text-xs) / 1 var(--e-font-mono);
    letter-spacing: 0.04em;
  }

  .e-grid-tools {
    margin-inline-start: auto;
    display: flex;
    gap: var(--e-space-2);
  }

  .e-grid-scroll {
    overflow: auto;
    max-height: var(--_max-h, none);
  }

  .e-grid-scroll:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: calc(-1 * var(--e-stroke-focus));
  }

  .e-gridtable--fixed {
    table-layout: fixed;
  }

  .e-gridtable {
    border-radius: 0;
    box-shadow: none;
    min-width: var(--_min-w, 0);
  }

  .e-gridtable thead th {
    position: sticky;
    top: 0;
    z-index: var(--e-z-raised);
    height: var(--_head-h);
    box-sizing: border-box;
  }

  .e-gridtable th[aria-sort="ascending"],
  .e-gridtable th[aria-sort="descending"] {
    color: var(--e-ink);
  }

  .e-sortbtn {
    display: inline-flex;
    align-items: center;
    gap: var(--e-space-1);
    min-height: var(--e-control-height);
    padding: var(--e-space-1) 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    cursor: pointer;
  }

  .e-sortbtn:hover {
    color: var(--e-ink);
  }

  .e-sortbtn:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-stroke-focus);
    border-radius: var(--e-radius-sm);
  }

  .e-gridtable .e-cell-check {
    width: var(--_check-w);
    padding-inline-end: 0;
    vertical-align: middle;
  }

  .e-gridtable tbody tr[data-selected] td {
    background: var(--e-surface-tint);
  }

  .e-gridtable tbody tr[data-selected]:hover td {
    background: var(--e-surface-hover);
    box-shadow: inset 0 0 0 0 transparent;
  }

  .e-table td.e-grid-empty {
    padding: 0;
  }

  .e-grid-foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--e-space-3);
    padding: var(--e-space-3) var(--e-space-4);
    border-top: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-grid-range {
    font: var(--e-weight-medium) var(--e-text-xs) / 1.2 var(--e-font-mono);
    color: var(--e-muted);
    font-variant-numeric: tabular-nums;
  }

  .e-grid-foot .e-pager {
    justify-content: flex-end;
  }

  .e-filterrow td {
    padding: var(--e-space-1) var(--e-space-3);
    background: var(--e-surface);
    box-shadow: inset 0 calc(-1 * var(--e-stroke-card)) 0 var(--e-border-strong);
    border-top: 0;
    position: sticky;
    top: var(--_head-h);
    z-index: var(--e-z-raised);
  }

  .e-filterrow .e-input {
    height: var(--e-control-height);
    font-size: var(--e-text-md);
    padding-inline: calc(var(--e-space-3) - var(--e-stroke-edge));
  }

  .e-filterrow .e-sel-trigger {
    height: var(--e-control-height);
    padding-inline-end: calc(var(--e-space-2) - var(--e-stroke-edge));
  }

  .e-filter-range {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--e-space-1);
  }

  .e-gridtable thead th,
  .e-gridtable thead td {
    white-space: nowrap;
  }

  .e-resizer {
    position: absolute;
    top: 0;
    inset-inline-end: calc(var(--e-space-6) / -2);
    z-index: var(--e-z-raised);
    width: var(--e-space-6);
    height: 100%;
    cursor: col-resize;
    touch-action: none;

    --_bar-w: var(--e-stroke-hair);
  }

  .e-resizer:hover,
  .e-resizer:focus-visible {
    --_bar-w: calc(var(--e-stroke-focus) + var(--e-stroke-hair));
  }

  .e-resizer::before {
    content: "";
    position: absolute;
    inset-block: 0;
    inset-inline: calc(-1 * var(--e-space-2));
  }

  .e-resizer::after {
    content: "";
    position: absolute;
    top: 22%;
    inset-inline-start: calc(50% - var(--_bar-w) / 2);
    width: var(--_bar-w);
    height: 56%;
    background: var(--e-border-strong);
    transition:
      width var(--e-duration-tap) var(--e-easing-out),
      inset-inline-start var(--e-duration-tap) var(--e-easing-out);
  }

  .e-resizer:hover::after,
  .e-resizer:focus-visible::after {
    background: var(--e-primary);
    border-radius: var(--e-radius-sm);
  }

  .e-resizer:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: calc(-1 * var(--e-stroke-focus));
    border-radius: var(--e-radius-sm);
  }

  .e-gridtable--fixed td,
  .e-gridtable--fixed th {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .e-gridtable .e-sticky {
    position: sticky;
    z-index: var(--e-z-raised);
    box-shadow: inset calc(-1 * var(--e-stroke-hair)) 0 0 var(--e-border);
  }

  .e-gridtable thead th.e-sticky {
    z-index: var(--e-z-sticky);
    background: var(--e-surface-tint);
  }

  .e-gridtable tbody td.e-sticky {
    background: var(--e-surface);
  }

  .e-gridtable tbody tr:hover td.e-sticky {
    background: var(--e-surface-hover);
  }

  .e-gridtable tbody tr[data-selected] td.e-sticky {
    background: var(--e-surface-tint);
  }

  .e-gridtable--virtual td {
    height: var(--_row-h);
    padding-block: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .e-spacer td {
    padding: 0;
    border: 0;
  }

  @media (forced-colors: active) {
    .e-gridtable tbody tr[data-selected] td {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }

    .e-resizer::after {
      background: CanvasText;
    }

    .e-resizer:hover::after,
    .e-resizer:focus-visible::after {
      background: Highlight;
    }
  }

  @media print {
    .e-grid-scroll {
      overflow: visible;
      max-height: none;
    }
  }

  .e-grid--cards {
    container-type: inline-size;
  }

  .e-grid-sortsel {
    display: none;
    min-width: 11rem;
  }

  .e-grid-bar--sortonly {
    display: none;
  }

  @container (max-width: 40rem) {
    .e-grid-sortsel {
      display: block;
      flex: 1 1 11rem;
    }

    .e-grid-bar--sortonly {
      display: flex;
    }

    .e-grid--cards .e-grid-scroll {
      overflow: visible;
      max-height: none;
    }

    .e-grid--cards .e-gridtable,
    .e-grid--cards .e-gridtable tbody {
      display: block;
      min-width: 0;
      width: 100%;
    }

    .e-grid--cards .e-gridtable thead {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      /* stylelint-disable-next-line property-no-deprecated -- clip hides text visually */
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }

    .e-grid--cards .e-grid-frame {
      overflow: visible;
      background: transparent;
    }

    /* The cards have no frame to close, so the toolbar's underline would sit on the first card's rounded top corners. */
    .e-grid--cards .e-grid-bar {
      border-bottom: 0;
    }

    .e-grid--cards .e-grid-frame::after {
      content: none;
    }

    .e-grid--cards .e-gridtable tbody tr {
      display: block;
      margin: 0 0 var(--e-space-3);
      padding: var(--e-space-1) var(--e-space-4);
      border-radius: var(--e-radius-md);
      background: var(--e-surface);
      box-shadow: var(--e-frame);
    }

    .e-grid--cards .e-gridtable tbody tr:hover td {
      background: transparent;
    }

    .e-grid--cards .e-gridtable tbody tr[data-selected] {
      background: var(--e-surface-tint);
    }

    .e-grid--cards .e-gridtable tbody tr[data-selected] td {
      background: transparent;
    }

    .e-grid--cards .e-gridtable td {
      display: grid;
      grid-template-columns: minmax(5rem, 38%) minmax(0, 1fr);
      gap: var(--e-space-3);
      align-items: baseline;
      padding: var(--e-space-2) 0;
      border-top: var(--e-stroke-hair) solid var(--e-border);
      overflow: visible;
      white-space: normal;
      text-align: start;
    }

    .e-grid--cards .e-gridtable tbody tr:first-child td:not(:first-child) {
      border-top: var(--e-stroke-hair) solid var(--e-border);
    }

    .e-grid--cards .e-gridtable tbody td:first-child {
      border-top: 0;
    }

    .e-grid--cards .e-gridtable td::before {
      content: attr(data-label);
      font: var(--e-weight-strong) var(--e-text-xs) / 1.3 var(--e-font-mono);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--e-muted);
    }

    .e-grid--cards .e-gridtable td.e-cell-check {
      display: flex;
      width: auto;
      padding: var(--e-space-2) 0;
    }

    .e-grid--cards .e-gridtable td.e-cell-check::before {
      content: none;
    }

    .e-grid--cards .e-gridtable .e-sticky {
      position: static;
      box-shadow: none;
    }

    .e-grid--cards .e-gridtable .e-num {
      text-align: start;
    }

    .e-grid--cards .e-gridtable .e-grid-empty {
      display: block;
    }

    .e-grid--cards .e-gridtable .e-grid-empty::before {
      content: none;
    }

    .e-grid--cards .e-filterrow {
      display: none;
    }

    .e-grid--cards .e-gridtable--fixed td {
      overflow: visible;
      text-overflow: clip;
    }
  }
}
</style>
