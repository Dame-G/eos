<script setup lang="ts" generic="Row extends DataGridRow">
import { computed, onBeforeUnmount, onMounted, ref, watch, type CSSProperties } from "vue";
import { useVirtualizer } from "@tanstack/vue-virtual";
import EButton from "../Button/EButton.vue";
import ECheckbox from "../Checkbox/ECheckbox.vue";
import EEmptyState from "../EmptyState/EEmptyState.vue";
import EIcon from "../Icon/EIcon.vue";
import EPagination from "../Pagination/EPagination.vue";
import "../Skeleton/ESkeleton.vue";
import EDataGridFilterRow from "./EDataGridFilterRow.vue";
import EDataGridResizer from "./EDataGridResizer.vue";
import EDataGridToolbar from "./EDataGridToolbar.vue";
import type { EOption } from "../Select/options.js";
import type { IconProp } from "../../icons/types.js";
import { useMessages } from "../../config.js";
import { warnOnce } from "../../warn.js";
import { useLocale } from "../../composables/useLocale.js";
import { useOverflow } from "../../composables/useOverflow.js";
import { cellValue, filterActive, foldText, parsePx } from "./grid.js";
import { useDataGrid } from "./useDataGrid.js";
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
import "./grid.css";

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
    /** Tints every other row. */
    striped?: boolean;
    /** Smaller text and tighter cells, for a grid with many rows. */
    dense?: boolean;
    /** Rows per page. 0 turns paging off. */
    pageSize?: number;
    /** Stops the table growing past this height (any CSS length) and scrolls inside it, with a sticky header. */
    maxHeight?: string;
    /** Renders only the rows in view, for thousands of rows. Replaces paging. `true` or `{ rowHeight = 48, height = 440, overscan = 8 }`. */
    virtual?: boolean | DataGridVirtual;
    /** Turns rows into cards below 40rem of the grid's own width. `virtual` and `resizable` grids keep the table. */
    cards?: boolean;
    /** Marks the data as living on a server. The grid shows the rows given, in the order given, and reports every change through `queryChange`, once on mount too, so the first fetch needs no code of its own. Give it `total` to page. */
    manual?: boolean;
    /** How many milliseconds to wait after the last keystroke in the search box or a text or number filter before the rows are filtered (or, with `manual`, before `queryChange`). Other changes apply at once. */
    searchDebounce?: number;
    /** With `manual`, how many rows there are in all. Without it the grid cannot page. */
    total?: number;
    /** Marks the data as loading, with `aria-busy`. With no rows yet it shows placeholder rows; with rows (the previous page) they stay, dimmed, until the new ones arrive. */
    loading?: boolean;
    /** How many placeholder rows `loading` shows, 5 as in `ETable`. As cards each placeholder is a whole card, so a phone shows fewer of them at once. */
    skeletonRows?: number;
    /** The title when there are no rows. @default "No results" */
    emptyTitle?: string;
    /** The sentence under the empty title, when there are no rows. */
    emptyText?: string;
    /** The icon above the empty title. @default "search" */
    emptyIcon?: IconProp;
    /** Shows a failed load in place of the rows. `true` says the default sentence; a string says your own. A "Try again" button emits `retry`. */
    error?: boolean | string;
    /** The name of a row for its checkbox ("Select Annual check-up"), when the first column's text is not a good one. */
    rowLabel?: (row: Row) => string;
  }>(),
  { pageSize: 10, searchDebounce: 0, skeletonRows: 5 },
);

const emit = defineEmits<{
  /** Sort, page, search or filters changed. With `manual`, fetch the rows this describes. */
  queryChange: [query: DataGridQuery];
  /** The Try again button of the `error` state was pressed. Fetch again. */
  retry: [];
}>();

const slots = defineSlots<{
  [K: `cell-${string}`]: (props: { row: Row; value: unknown }) => unknown;
  [K: `header-${string}`]: (props: { column: DataGridColumn<Row> }) => unknown;
  /** Buttons that act on the selected rows, shown beside the count. */
  "bulk-actions"?: () => unknown;
  /** Anything else for the bar above the table. */
  toolbar?: () => unknown;
  /** Your own empty state, when there are no rows. `filtered` is true when a search or filter hid them, and `clearFilters` clears both. */
  empty?: (props: { filtered: boolean; clearFilters: () => void }) => unknown;
  /** Your own failed-load state, in place of the sentence and button, when `error` is set. */
  error?: () => unknown;
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

const NONE = "__e-none__";

/** Columns hidden from the Columns menu, by key. A column is shown unless it is `false` here. */
const columnVisibility = ref<Record<string, boolean>>({});
/** Widths people dragged or keyed, in pixels, by key. */
const columnSizing = ref<Record<string, number>>({});

const colByKey = computed(() => new Map(props.columns.map((c) => [c.key, c])));

// What a default cell writes: a column's `format`, else a date or a figure in the configured locale.
function show(row: Row, c: DataGridColumn<Row>): string {
  const v = cellValue(row, c);
  if (v == null) return "";
  const f = c.format;
  if (typeof f === "function") return f(v, row);
  const isNumber = typeof v === "number" && Number.isFinite(v);
  if (f === "date" || (!f && v instanceof Date))
    return v instanceof Date || typeof v === "string" ? fmtDate(v) : String(v);
  if (f === "currency") return isNumber ? loc.formatMoney(v) : String(v);
  if (f === "number" || (!f && c.numeric && isNumber)) return isNumber ? loc.formatNumber(v) : String(v);
  return String(v);
}
function fmtDate(v: Date | string): string {
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : loc.formatDate(d);
}
const vopt = computed(() =>
  props.virtual ? { rowHeight: 48, height: 440, overscan: 8, ...(props.virtual === true ? {} : props.virtual) } : null,
);
const pageSize = computed(() => (vopt.value ? 0 : props.pageSize));
const cards = computed(() => !!props.cards && !vopt.value && !props.resizable);
const q = computed(() => foldText(search.value.trim()));
const anyFilter = computed(() => Object.values(filters.value).some(filterActive));

/** The shown columns, in order. */
const cols = computed(() => props.columns.filter((c) => columnVisibility.value[c.key] !== false));

/*
 * What is typed (the search and the text and number filters) applies after `searchDebounce`; a click on a heading, a
 * page or a choice applies at once. `applied` is what the rows are filtered by, or, with `manual`, what was reported.
 */
const typed = () =>
  JSON.stringify([
    search.value,
    Object.entries(filters.value).filter(([key]) => colByKey.value.get(key)?.filter?.type !== "select"),
  ]);
const applied = ref({ search: search.value, filters: filters.value, typed: typed() });
let queryTimer: ReturnType<typeof setTimeout> | undefined;
function commit() {
  clearTimeout(queryTimer);
  applied.value = { search: search.value, filters: filters.value, typed: typed() };
  if (props.manual)
    emit("queryChange", {
      sort: sort.value,
      page: page.value,
      pageSize: pageSize.value,
      search: search.value,
      filters: filters.value,
    });
}
watch([sort, page, search, filters], () => {
  if (props.searchDebounce > 0 && typed() !== applied.value.typed) {
    clearTimeout(queryTimer);
    queryTimer = setTimeout(commit, props.searchDebounce);
  } else commit();
});
onMounted(() => {
  if (props.manual) commit();
});

/* Filter, sort and page, unless the grid is `manual` and the server sent the answer. */
const {
  view,
  total,
  pages,
  page: cur,
} = useDataGrid(
  () => props.rows,
  () => props.columns,
  {
    searched: cols,
    sort,
    search: () => applied.value.search,
    filters: () => applied.value.filters,
    page,
    pageSize,
    manual: () => props.manual,
    total: () => props.total,
    locale: loc.locale,
    show,
  },
);
watch(pages, (n) => {
  if (page.value > n) page.value = n;
});
// A server grid pages only when it says how many rows there are in all.
watch(
  () => props.manual && props.total === undefined && pageSize.value > 0 && props.rows.length > 0,
  (missing) => {
    if (missing)
      warnOnce("EDataGrid-total", "EDataGrid `manual` needs `total` to page; without it every row is one page.");
  },
  { immediate: true },
);
const hasFilterRow = computed(() => !!props.filterable && cols.value.some((c) => c.filter));
const colCount = computed(() => cols.value.length + (props.selectable ? 1 : 0));
const from = computed(() =>
  total.value === 0 ? 0 : (cur.value - 1) * (pageSize.value > 0 ? pageSize.value : total.value) + 1,
);
const to = computed(() => (pageSize.value > 0 ? Math.min(total.value, cur.value * pageSize.value) : total.value));
const sortedCol = computed(() => (sort.value ? colByKey.value.get(sort.value.key) : undefined));

/*
 * Selection is by id, matched as text so "7" and 7 are one row. The model keeps the ids as the rows have them, and
 * keeps ids that are not among the rows (another page, a server).
 */
const pickedKeys = computed(() => new Set(selected.value.map(String)));
const isPicked = (row: Row) => pickedKeys.value.has(String(row.id));
function pick(rows: Row[], on: boolean) {
  const keys = new Set(rows.map((r) => String(r.id)));
  const kept = selected.value.filter((id) => !keys.has(String(id)));
  selected.value = on ? [...kept, ...rows.map((r) => r.id as Row["id"])] : kept;
}
const nPicked = computed(() => selected.value.length);
const allOn = computed(() => view.value.length > 0 && view.value.every(isPicked));
const someOn = computed(() => view.value.some(isPicked));

/** A heading cycles ascending, descending, off. Another column starts ascending. */
function toggleSort(c: DataGridColumn<Row>) {
  const s = sort.value;
  sort.value = s?.key !== c.key ? { key: c.key, dir: "asc" } : s.dir === "asc" ? { key: c.key, dir: "desc" } : null;
  page.value = 1;
}
function toggleColumn(key: string, visible: boolean) {
  columnVisibility.value = { ...columnVisibility.value, [key]: visible };
}

/*
 * Virtual rows: each rendered row is measured, so a row that the text size or the theme makes taller than `rowHeight`
 * keeps the scroll exact. Rows are one line (see grid.css), so the first row measured is the estimate for the rest.
 */
const scrollEl = ref<HTMLElement | null>(null);
const tableEl = ref<HTMLElement | null>(null);
const rowPx = ref<number | undefined>(undefined);
const virtualizer = useVirtualizer(
  computed(() => ({
    count: vopt.value ? view.value.length : 0,
    getScrollElement: () => scrollEl.value,
    estimateSize: () => rowPx.value ?? vopt.value?.rowHeight ?? 48,
    overscan: vopt.value?.overscan ?? 8,
    getItemKey: (i: number) => view.value[i]?.id ?? i,
    initialRect: { width: 0, height: parsePx(vopt.value?.height) ?? 0 },
  })),
);
function measureRow(el: unknown) {
  if (!(el instanceof HTMLElement) || !vopt.value) return;
  // The first row of the body has no rule above it, so it is a pixel shorter than the rest: the next one is the estimate.
  if (rowPx.value === undefined && el.previousElementSibling) {
    const h = el.getBoundingClientRect().height;
    if (h > 0) {
      rowPx.value = Math.round(h); // as the virtualizer rounds what it measures
      virtualizer.value.measure();
    }
  }
  virtualizer.value.measureElement(el);
}
watch(
  () => vopt.value?.rowHeight,
  () => (rowPx.value = undefined),
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

const cellProps = (row: Row, c: DataGridColumn<Row>) => ({ row, value: cellValue(row, c) });

const fixedLayout = computed(() => props.resizable || !!vopt.value || cols.value.some((c) => c.width));
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
const scrollStyle = computed(() => {
  const h = vopt.value?.height;
  return {
    height: typeof h === "number" ? `${h}px` : h,
    "--_max-h": !vopt.value && props.maxHeight ? props.maxHeight : undefined,
    "--_head-h": headH.value ? `${headH.value}px` : undefined,
  } as CSSProperties;
});
const role = (r: string) => (cards.value ? r : undefined);

/*
 * As cards, below 40rem of its own width, the grid hides its headings, so nothing in them may take focus. The width is
 * decided once, by the container query in table.css that hides the heading row: the grid reads whether it did.
 */
const root = ref<HTMLElement | null>(null);
const narrow = ref(false);
const overflows = useOverflow(scrollEl, [() => tableEl.value]);
const headInert = computed(() => cards.value && narrow.value);
let widthObserver: ResizeObserver | undefined;
function measureNarrow() {
  const head = tableEl.value?.querySelector("thead");
  narrow.value = !!head && getComputedStyle(head).position === "absolute";
}
onMounted(() => {
  measureNarrow();
  if (typeof ResizeObserver === "undefined" || !root.value) return;
  widthObserver = new ResizeObserver(measureNarrow);
  widthObserver.observe(root.value);
});
watch(cards, measureNarrow, { flush: "post" });
onBeforeUnmount(() => widthObserver?.disconnect());

// A row's checkbox is named after the row: the first shown column's text, else its id.
const labelOf = (row: Row): string => {
  const given = props.rowLabel?.(row);
  if (given) return given;
  const first = cols.value[0];
  return (first && show(row, first)) || String(row.id);
};
const busyRows = computed(() => !!props.loading && view.value.length > 0);
const failed = computed(() => !!props.error);
const errorText = computed(() => (typeof props.error === "string" ? props.error : t("loadFailed")));
const filtered = computed(() => anyFilter.value || !!q.value);

const sortables = computed(() => cols.value.filter((c) => c.sortable));
const sortOptions = computed<EOption[]>(() => [
  { value: NONE, label: t("sortBy") },
  ...sortables.value.flatMap((c) =>
    (["asc", "desc"] as const).map((d) => ({
      value: `${c.key}:${d}`,
      label: t(d === "asc" ? "sortOptionAsc" : "sortOptionDesc", { col: c.label }),
    })),
  ),
]);
const sortSelectValue = computed(() => (sort.value ? `${sort.value.key}:${sort.value.dir}` : NONE));
const showSortSelect = computed(() => cards.value && sortables.value.length > 0);
const hasToolbar = computed(() => !!slots.toolbar);
const barOther = computed(
  () => !!props.searchable || !!props.columnToggle || nPicked.value > 0 || anyFilter.value || hasToolbar.value,
);
const showBar = computed(() => barOther.value || showSortSelect.value);

function onSearch(value: string) {
  search.value = value;
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
  columnSizing.value = { ...columnSizing.value, [key]: px };
}
function resetWidth(key: string) {
  const next = { ...columnSizing.value };
  delete next[key];
  columnSizing.value = next;
}
</script>

<template>
  <div ref="root" class="e-grid" :class="{ 'e-grid--cards e-cards': cards }">
    <div class="e-grid-frame">
      <EDataGridToolbar
        v-if="showBar"
        :searchable="searchable"
        :search-placeholder="searchPlaceholder"
        :search="search"
        :picked="nPicked"
        :sort-options="showSortSelect ? sortOptions : undefined"
        :sort-value="sortSelectValue"
        :filtered="filtered"
        :columns="
          columnToggle
            ? columns.map((c) => ({ id: c.key, label: c.label, visible: columnVisibility[c.key] !== false }))
            : undefined
        "
        :sort-only="!barOther"
        @update:search="onSearch"
        @sort="chooseSort"
        @clear="clearFilters"
        @toggle-column="toggleColumn"
      >
        <template #bulk-actions><slot name="bulk-actions" /></template>
        <template v-if="hasToolbar" #toolbar><slot name="toolbar" /></template>
      </EDataGridToolbar>
      <!-- As cards the heading row is hidden, so the filters move above the rows, as the sort moves to a menu. -->
      <EDataGridFilterRow
        v-if="hasFilterRow && headInert"
        stacked
        :columns="cols"
        :filters="filters"
        :sticky-style="() => undefined"
        :role="() => undefined"
        @filter="setFilter"
      />
      <div
        ref="scrollEl"
        class="e-grid-scroll"
        :style="scrollStyle"
        :tabindex="overflows ? 0 : undefined"
        :role="overflows ? 'region' : undefined"
        :aria-label="overflows ? caption : undefined"
      >
        <table
          ref="tableEl"
          class="e-table e-gridtable"
          :class="{
            'e-gridtable--virtual': vopt,
            'e-gridtable--fixed': fixedLayout,
            'e-table--busy': busyRows,
            'e-table--striped': striped,
            'e-table--dense': dense,
          }"
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
          <thead :role="role('rowgroup')" :inert="headInert || undefined">
            <tr ref="headRow" :role="role('row')">
              <th v-if="selectable" scope="col" class="e-cell-check" :role="role('columnheader')">
                <ECheckbox
                  hide-label
                  :label="vopt ? t('selectAll') : t('selectAllPage')"
                  :model-value="allOn"
                  :indeterminate="someOn && !allOn"
                  @update:model-value="pick(view, !allOn)"
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
                <button v-if="c.sortable" type="button" class="e-sortbtn" @click="toggleSort(c)">
                  <slot :name="`header-${c.key}`" :column="c">{{ c.label }}</slot>
                  <EIcon
                    :name="sort?.key === c.key ? (sort.dir === 'asc' ? 'arrow-up' : 'arrow-down') : 'sort'"
                    size="sm"
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
            <EDataGridFilterRow
              v-if="hasFilterRow && !headInert"
              :columns="cols"
              :filters="filters"
              :selectable="selectable"
              :sticky-style="stickStyle"
              :role="role"
              @filter="setFilter"
            />
          </thead>
          <tbody :role="role('rowgroup')">
            <tr v-if="failed" :role="role('row')">
              <td :colspan="colCount" class="e-grid-empty" :role="role('cell')">
                <slot name="error">
                  <EEmptyState bare tone="danger" icon="alert" :title="errorText">
                    <template #action>
                      <EButton variant="outline" @click="emit('retry')">{{ t("retry") }}</EButton>
                    </template>
                  </EEmptyState>
                </slot>
              </td>
            </tr>
            <template v-else-if="loading && view.length === 0">
              <tr v-for="n in skeletonRows" :key="`s${n}`" :role="role('row')">
                <td v-if="selectable" class="e-cell-check" :role="role('cell')" />
                <td v-for="c in cols" :key="c.key" :role="role('cell')" :data-label="c.label">
                  <span class="e-skel" />
                </td>
              </tr>
            </template>
            <tr v-else-if="view.length === 0" :role="role('row')">
              <td :colspan="colCount" class="e-grid-empty" :role="role('cell')">
                <slot name="empty" :filtered="filtered" :clear-filters="clearFilters">
                  <EEmptyState bare :icon="emptyIcon || 'search'" :title="emptyTitle || t('noResults')">
                    {{ emptyText || (filtered ? t("noMatchesFilters") : t("nothingYet")) }}
                    <template v-if="filtered" #action>
                      <EButton variant="outline" @click="clearFilters">{{ t("clearFilters") }}</EButton>
                    </template>
                  </EEmptyState>
                </slot>
              </td>
            </tr>
            <template v-else>
              <tr v-if="vopt && spaceTop > 0" aria-hidden="true" class="e-spacer" :style="{ height: `${spaceTop}px` }">
                <td :colspan="colCount" />
              </tr>
              <tr
                v-for="{ row, index } in rowsToRender"
                :key="row.id"
                :ref="vopt ? measureRow : undefined"
                :role="role('row')"
                :data-index="vopt ? index : undefined"
                :data-selected="isPicked(row) ? '' : undefined"
                :aria-rowindex="vopt ? index + 2 + (hasFilterRow ? 1 : 0) : undefined"
              >
                <td v-if="selectable" class="e-cell-check" :role="role('cell')">
                  <ECheckbox
                    hide-label
                    :label="t('selectRowNamed', { label: labelOf(row) })"
                    :model-value="isPicked(row)"
                    @update:model-value="pick([row], $event)"
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
                  <slot :name="`cell-${c.key}`" v-bind="cellProps(row, c)">{{ show(row, c) }}</slot>
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
      <div class="e-grid-foot">
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
          :label="t('paginationFor', { caption })"
          @update:model-value="page = $event"
        />
      </div>
      <!-- Always in the page, so a screen reader hears the text change; a live region that arrives with its text is missed. -->
      <span class="e-sr" role="status">{{
        failed
          ? ""
          : loading
            ? t("loading")
            : (sortedCol ? t(sort?.dir === "asc" ? "sortedAsc" : "sortedDesc", { col: sortedCol.label }) + " " : "") +
              t("rowsAnnounce", { n: total })
      }}</span>
      <span class="e-sr" role="status">{{ nPicked ? t("selected", { n: nPicked }) : "" }}</span>
      <span class="e-sr" role="alert">{{ failed ? errorText : "" }}</span>
    </div>
  </div>
</template>
