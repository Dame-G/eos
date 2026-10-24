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
import "../Definition/EDefinition.vue";
import type { EOption } from "../Select/options.js";
import type { IconProp } from "../../icons/types.js";
import { useMessages } from "../../config.js";
import { isProduction } from "../../env.js";
import { useLocale } from "../../composables/useLocale.js";
import { useOverflow } from "../../composables/useOverflow.js";
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
    /** With `manual`, how many milliseconds to wait after the last keystroke in the search box or a text or number filter before `queryChange`. Other changes report at once. */
    searchDebounce?: number;
    /** With `manual`, how many rows there are in all. */
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
    /**
     * Renders a bare table for a short static list, with no toolbar, filters, paging or footer.
     * @deprecated Use `ETable` for a short static list. `bare` still works, and warns in development.
     */
    bare?: boolean;
  }>(),
  { pageSize: 10, cards: true, searchDebounce: 0, skeletonRows: 5 },
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

if (props.bare && !isProduction())
  console.warn("[eos] EDataGrid `bare` is deprecated. Use ETable for a short static list.");

/** Columns hidden from the Columns menu, by key. A column is shown unless it is `false` here. */
const columnVisibility = ref<Record<string, boolean>>({});
/** Widths people dragged or keyed, in pixels, by key. */
const columnSizing = ref<Record<string, number>>({});

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
const vopt = computed(() =>
  props.virtual ? { rowHeight: 48, height: 440, overscan: 8, ...(props.virtual === true ? {} : props.virtual) } : null,
);
const pageSize = computed(() => (vopt.value || props.bare ? 0 : (props.pageSize ?? 10)));
const paging = computed(() => pageSize.value > 0 && !props.manual);
const resizable = computed(() => !!props.resizable && !props.bare);
const cards = computed(() => props.cards !== false && !vopt.value && !resizable.value);
const q = computed(() => foldText(search.value.trim()));
const anyFilter = computed(() => Object.values(filters.value).some(filterActive));

/** The shown columns, in order. */
const cols = computed(() => props.columns.filter((c) => columnVisibility.value[c.key] !== false));

/*
 * The rows go through three steps, each a computed over the one before: filter (the column filters, then the search
 * over the shown columns), sort, then the page. A `manual` grid does none of it: the server sent the answer.
 */
const filteredRows = computed<Row[]>(() => {
  if (props.manual) return props.rows;
  const active = Object.entries(filters.value).flatMap(([key, f]) => {
    const c = colByKey.value.get(key);
    return c && filterActive(f) ? [{ c, f }] : [];
  });
  const needle = q.value;
  if (!active.length && !needle) return props.rows;
  const searched = cols.value;
  return props.rows.filter(
    (row) =>
      active.every(({ c, f }) => passesFilter(c, cellValue(row, c), f, show(row, c))) &&
      (!needle ||
        searched.some((c) => {
          const v = cellValue(row, c);
          return v != null && (foldText(v).includes(needle) || foldText(show(row, c)).includes(needle));
        })),
  );
});

const sortedRows = computed<Row[]>(() => {
  const s = sort.value;
  const c = s ? colByKey.value.get(s.key) : undefined;
  if (props.manual || !s || !c?.sortable) return filteredRows.value;
  const sign = s.dir === "desc" ? -1 : 1;
  const locale = loc.locale.value;
  // Equal values keep the order they were given in.
  return filteredRows.value
    .map((row, i) => ({ row, i, v: cellValue(row, c) }))
    .sort((a, b) => sign * compareValues(a.v, b.v, locale) || a.i - b.i)
    .map((x) => x.row);
});

/** The rows on the current page, or every row when the grid does not page. */
const view = computed<Row[]>(() => {
  if (!paging.value) return sortedRows.value;
  const start = Math.max(0, page.value - 1) * pageSize.value;
  return sortedRows.value.slice(start, start + pageSize.value);
});
const total = computed(() => (props.manual ? (props.total ?? props.rows.length) : sortedRows.value.length));
const pages = computed(() => (pageSize.value > 0 ? Math.max(1, Math.ceil(total.value / pageSize.value)) : 1));
const cur = computed(() => Math.min(page.value, pages.value));
watch(pages, (n) => {
  if (page.value > n) page.value = n;
});
const hasFilterRow = computed(() => !!props.filterable && !props.bare && cols.value.some((c) => c.filter));
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

const scrollEl = ref<HTMLElement | null>(null);
const tableEl = ref<HTMLElement | null>(null);
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

const cellProps = (row: Row, c: DataGridColumn<Row>) => ({ row, value: cellValue(row, c) });

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

// Below 40rem of its own width a card grid hides its headings, so nothing in them may take focus.
const root = ref<HTMLElement | null>(null);
const narrow = ref(false);
const overflows = useOverflow(scrollEl, [() => tableEl.value]);
const scrollable = computed(() => overflows.value || !!props.maxHeight || !!vopt.value);
const headInert = computed(() => cards.value && narrow.value);
let widthObserver: ResizeObserver | undefined;
onMounted(() => {
  if (typeof ResizeObserver === "undefined" || !root.value) return;
  const measure = () => {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    narrow.value = (root.value?.clientWidth ?? Infinity) <= 40 * rem;
  };
  widthObserver = new ResizeObserver(measure);
  widthObserver.observe(root.value);
  measure();
});
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

const sortables = computed(() => props.columns.filter((c) => c.sortable));
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
const showBar = computed(() => !props.bare && (barOther.value || showSortSelect.value));

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
let queryTimer: ReturnType<typeof setTimeout> | undefined;
/** What is typed: the search and the text and number filters. A choice from a select filter is not typing. */
const typed = () =>
  JSON.stringify([
    search.value,
    Object.entries(filters.value).filter(([key]) => colByKey.value.get(key)?.filter?.type !== "select"),
  ]);
let reportedTyped = typed();
function report() {
  clearTimeout(queryTimer);
  reportedTyped = typed();
  emit("queryChange", {
    sort: sort.value,
    page: page.value,
    pageSize: pageSize.value,
    search: search.value,
    filters: filters.value,
  });
}
watch([sort, page, search, filters], () => {
  // Typing in the search box or a filter field waits for a pause; a click on a heading, a page or a choice goes at once.
  if (props.manual && props.searchDebounce > 0 && typed() !== reportedTyped) {
    clearTimeout(queryTimer);
    queryTimer = setTimeout(report, props.searchDebounce);
  } else report();
});
onMounted(() => {
  if (props.manual) report();
});
</script>

<template>
  <div ref="root" class="e-grid" :class="{ 'e-grid--bare': bare, 'e-grid--cards e-cards': cards }">
    <div class="e-grid-frame">
      <EDataGridToolbar
        v-if="showBar"
        :searchable="searchable"
        :search-placeholder="searchPlaceholder"
        :search="search"
        :picked="nPicked"
        :sort-options="showSortSelect ? sortOptions : undefined"
        :sort-value="sortSelectValue"
        :filtered="anyFilter || !!q"
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
        :tabindex="scrollable ? 0 : undefined"
        :role="scrollable ? 'region' : undefined"
        :aria-label="scrollable ? caption : undefined"
      >
        <table
          ref="tableEl"
          class="e-table e-gridtable"
          :class="{ 'e-gridtable--virtual': vopt, 'e-gridtable--fixed': fixedLayout, 'e-gridtable--busy': busyRows }"
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
                  bare
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
                  <EEmptyState bare icon="alert" :title="typeof error === 'string' ? error : t('loadFailed')">
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
                :data-selected="isPicked(row) ? '' : undefined"
                :aria-rowindex="vopt ? index + 2 + (hasFilterRow ? 1 : 0) : undefined"
              >
                <td v-if="selectable" class="e-cell-check" :role="role('cell')">
                  <ECheckbox
                    bare
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
          :label="t('paginationFor', { caption })"
          @update:model-value="page = $event"
        />
      </div>
      <span class="e-sr" role="status">{{
        failed
          ? ""
          : loading
            ? t("loading")
            : (sortedCol ? t(sort?.dir === "asc" ? "sortedAsc" : "sortedDesc", { col: sortedCol.label }) + " " : "") +
              t("rowsAnnounce", { n: total })
      }}</span>
      <span class="e-sr" role="status">{{ nPicked ? t("selected", { n: nPicked }) : "" }}</span>
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
    container-type: inline-size;
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

  /* The frame does not clip: its bar and foot paint no background, and the scroller takes the frame's corners itself, so the edge is painted once on each curve. */
  .e-grid-frame {
    position: relative;
    border-radius: inherit;
    background: var(--e-surface);
  }

  /* A wrapping cluster: the controls share one left edge, and below 26rem each takes a full row. */
  .e-grid-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--e-gap-snug);
    padding: var(--e-gap-base) var(--e-pad-card);
    border-bottom: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-grid-search {
    flex: 1 1 10rem;
    max-width: 24rem;
  }

  .e-grid-search .e-input {
    padding-inline-start: var(--e-gap-snug);
  }

  .e-grid-picked,
  .e-grid-tools {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--e-gap-snug);
  }

  .e-grid-count {
    font: var(--e-type-kicker);
    letter-spacing: var(--e-tracking-label);
  }

  .e-grid-tools {
    margin-inline-start: auto;
  }

  .e-grid-scroll {
    overflow: auto;
    max-height: var(--_max-h, none);
  }

  /* The scroller sits flush in the frame, which has no border of its own (its outline is drawn over it). Where it meets a frame edge it takes that corner, so the frame's clip does not cut off its focus ring. */
  .e-grid-scroll:first-child {
    border-start-start-radius: inherit;
    border-start-end-radius: inherit;
  }

  .e-grid-scroll:not(:has(+ .e-grid-foot)) {
    border-end-start-radius: inherit;
    border-end-end-radius: inherit;
  }

  .e-grid-scroll:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: calc(-1 * var(--e-stroke-focus));
  }

  .e-gridtable--busy tbody {
    opacity: 0.5;
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
    gap: var(--e-gap-tight);
    min-height: var(--e-control-height);
    padding: var(--e-gap-tight) 0;
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
    background: var(--e-wash-hover);
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
    gap: var(--e-gap-snug);
    padding: var(--e-gap-base) var(--e-pad-card);
    border-top: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-grid-range {
    font: var(--e-type-meta);
    color: var(--e-muted);
    font-variant-numeric: tabular-nums;
  }

  /* The pager sizes itself to its container, so it needs a width of its own here, not the nothing its content gives. */
  .e-grid-foot .e-pager {
    flex: 1 1 26rem;
    justify-content: flex-end;
  }

  .e-filterrow td {
    padding: var(--e-gap-tight) var(--e-pad-control-sm);
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
    padding-inline: calc(var(--e-pad-control-sm) - var(--e-stroke-edge));
  }

  .e-filterrow .e-sel-trigger {
    height: var(--e-control-height);
    padding-inline-end: calc(var(--e-gap-snug) - var(--e-stroke-edge));
  }

  .e-grid-filters {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 11rem), 1fr));
    gap: var(--e-gap-snug);
    align-items: end;
    padding-block: var(--e-gap-base);
  }

  .e-grid-filters > .e-filter-range {
    grid-column: 1 / -1;
  }

  .e-filter-range {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--e-gap-tight);
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

  /* A sticky cell stays opaque, so the hover wash is laid over the surface. */
  .e-gridtable tbody tr:hover td.e-sticky {
    background: linear-gradient(var(--e-wash-hover), var(--e-wash-hover)) var(--e-surface);
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
    .e-grid-frame::after {
      border: var(--e-stroke-card) solid CanvasText;
      box-shadow: none;
    }

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

    /* The cards have no frame to close, so the bars sit flush with them and draw no rule. */
    .e-grid--cards .e-grid-frame {
      background: transparent;
    }

    .e-grid--cards .e-grid-frame::after {
      content: none;
    }

    .e-grid--cards :is(.e-grid-bar, .e-grid-foot) {
      padding-inline: 0;
      border: 0;
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

    .e-grid--cards .e-gridtable td.e-cell-check {
      display: flex;
      width: auto;
      padding: var(--e-gap-snug) 0;
    }

    .e-grid--cards .e-gridtable td.e-cell-check::before {
      content: none;
    }

    .e-grid--cards .e-gridtable .e-sticky {
      position: static;
      box-shadow: none;
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

    .e-grid--cards .e-grid-foot {
      padding-block-end: 0;
    }
  }

  @container (max-width: 26rem) {
    .e-grid-search,
    .e-grid-sortsel,
    .e-grid-picked,
    .e-grid-tools {
      flex: 1 1 100%;
      max-width: none;
    }

    .e-grid-picked > :not(.e-grid-count),
    .e-grid-tools > * {
      flex: 1 1 auto;
    }

    /* The pager stacks above the range text: its page status on top, Previous and Next side by side below it. */
    .e-grid-foot .e-pager {
      display: grid;
      grid-template-columns: 1fr 1fr;
      flex-basis: 100%;
      order: -1;
    }

    .e-grid-foot .e-pager-status {
      grid-column: 1 / -1;
      order: -1;
      text-align: center;
    }

    .e-grid-range {
      flex: 1 1 100%;
      text-align: center;
    }
  }
}
</style>
