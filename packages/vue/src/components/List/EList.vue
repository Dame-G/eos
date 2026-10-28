<script setup lang="ts">
import { computed, nextTick, provide, ref, shallowReactive, shallowRef } from "vue";
import { listKey, type ListKey, type ListWindow } from "./listContext.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The list's accessible name, such as "Games". */
    label: string;
    /** `current`: each row is a button (or a link) that opens something, and the open one is marked current. `select`: a listbox, and the chosen row is selected. */
    mode?: "current" | "select";
    /** Makes the row that focus moves to the current or selected one, so the arrow keys step through what is shown, as in a list of moves. */
    followFocus?: boolean;
  }>(),
  { mode: "current" },
);

const emit = defineEmits<{
  /** A row was chosen: pressed, or reached with the arrow keys when `followFocus`. The `value` of the row. */
  select: [value: ListKey];
}>();

defineSlots<{
  /** The rows: `EListRow`s, directly or inside an `EVirtualList`. */
  default?(): unknown;
}>();

/** The `value` of the current or selected row. Without a binding it keeps its own state. */
const model = defineModel<ListKey | null>();

const root = ref<HTMLElement | null>(null);
/** The rows in the page now, by value: a virtual list renders only some. */
const present = shallowReactive(new Set<ListKey>());
/** The row that last had focus, so Tab comes back to it. */
const active = ref<ListKey | undefined>();
const win = shallowRef<ListWindow | null>(null);

/** The one row Tab lands on: the one last focused, else the current one, else none (then the list itself, which hands focus to its first row). */
const stop = computed<ListKey | undefined>(() => {
  if (active.value !== undefined && present.has(active.value)) return active.value;
  if (model.value != null && present.has(model.value)) return model.value;
  return undefined;
});

function choose(key: ListKey) {
  model.value = key;
  emit("select", key);
}

provide(listKey, {
  mode: computed(() => props.mode),
  isChosen: (key) => model.value === key,
  isStop: (key) => stop.value === key,
  register: (key) => present.add(key),
  unregister: (key) => present.delete(key),
  choose,
  focused(key) {
    active.value = key;
    if (props.followFocus && model.value !== key) choose(key);
  },
  attachWindow: (w) => (win.value = w),
});

/** The rows (and the cells of a multi-cell row) of this list in the page, in order; not those of a list nested inside one. */
function rows(): HTMLElement[] {
  const el = root.value;
  if (!el) return [];
  return [...el.querySelectorAll<HTMLElement>(".e-listrow")].filter((r) => r.closest(".e-list") === el);
}

const indexOf = (row: Element) => Number(row.closest("[data-index]")?.getAttribute("data-index") ?? -1);
const enabled = (row: Element | null | undefined) => !!row && row.getAttribute("aria-disabled") !== "true";
/** What a line holds: a plain row is its own line, a multi-cell row (`.e-cellrow`) holds its cells. */
const lineOf = (row: Element) => row.closest(".e-cellrow") ?? row;
const cellsOf = (line: Element): HTMLElement[] =>
  line.classList.contains("e-cellrow") ? [...line.querySelectorAll<HTMLElement>(".e-listrow")] : [line as HTMLElement];

/** The target to focus in a line, reaching for column `col` and settling on the nearest one that is available. */
function pickIn(cells: HTMLElement[], col: number): HTMLElement | undefined {
  const order = cells
    .map((cell, i) => ({ cell, gap: Math.abs(i - Math.min(col, cells.length - 1)) }))
    .sort((a, b) => a.gap - b.gap);
  return order.find((o) => enabled(o.cell))?.cell;
}

/** The lines in the page, in order, each as its list of targets. */
function lines(): HTMLElement[][] {
  const out: HTMLElement[][] = [];
  const seen = new Map<Element, HTMLElement[]>();
  for (const row of rows()) {
    const line = lineOf(row);
    let group = seen.get(line);
    if (!group) {
      group = [];
      seen.set(line, group);
      out.push(group);
    }
    group.push(row);
  }
  return out;
}

/** Renders row `index` of a virtual list, scrolling it into the page first, and waits a few frames for it to appear. Answers its targets: one for a row, a few for a multi-cell row. */
async function rowAt(index: number): Promise<HTMLElement[] | null> {
  const w = win.value;
  const el = root.value;
  if (!w || !el) return null;
  w.scrollToIndex(index);
  for (let i = 0; i < 10; i++) {
    await nextTick();
    const found = [...el.querySelectorAll<HTMLElement>(`[data-index="${index}"] .e-listrow`)];
    if (found.length) return found;
    await new Promise((r) => requestAnimationFrame(r));
  }
  return null;
}

/** In a virtual list: from row `index`, steps by `step` past unavailable rows and focuses the first available one, in column `col`. */
async function focusFrom(index: number, step: 1 | -1, col: number) {
  const count = win.value?.count() ?? 0;
  for (let i = index; i >= 0 && i < count; i += step) {
    const cells = await rowAt(i);
    if (!cells) return;
    const pick = pickIn(cells, col);
    if (pick) return pick.focus();
  }
}

/**
 * Up and Down move to the previous and next available row, Home and End to the first and last. Unavailable rows are
 * passed over, and focus stays put at either end. In a row of cells, Left and Right move between the cells and Up and
 * Down keep to the same column.
 */
function onKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  const horizontal = event.key === "ArrowLeft" || event.key === "ArrowRight";
  if (!horizontal && !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  const all = rows();
  if (!all.length) return;
  const target = event.target as Element;
  const here = target.closest(".e-listrow") as HTMLElement | null;
  // A control beside a row (its actions) keeps its own keys.
  if (!here && target !== root.value) return;
  if (here && !all.includes(here)) return; // a row of a nested list: it has its own keys
  if (horizontal) {
    if (!here) return;
    const line = lineOf(here);
    if (!line.classList.contains("e-cellrow")) return;
    event.preventDefault();
    const cells = cellsOf(line);
    const rtl = getComputedStyle(line).direction === "rtl";
    const forward = (event.key === "ArrowRight") !== rtl;
    const next = forward ? cells.slice(cells.indexOf(here) + 1) : cells.slice(0, cells.indexOf(here)).reverse();
    next.find(enabled)?.focus();
    return;
  }
  event.preventDefault();
  const down = event.key === "ArrowDown" || event.key === "Home";
  const col = here ? cellsOf(lineOf(here)).indexOf(here) : 0;
  if (win.value) {
    const from = here ? indexOf(here) : -1;
    const start = event.key === "Home" ? 0 : event.key === "End" ? win.value.count() - 1 : from + (down ? 1 : -1);
    void focusFrom(start, down ? 1 : -1, col);
    return;
  }
  const all_ = lines();
  const at = here ? all_.findIndex((g) => g.includes(here)) : -1;
  const order = down ? all_ : [...all_].reverse();
  const after = event.key === "Home" || event.key === "End" ? -1 : order.findIndex((g) => g === all_[at]);
  for (const group of order.slice(after + 1)) {
    const pick = pickIn(group, col);
    if (pick) return pick.focus();
  }
}

/** Tab reached the list itself, because no row is its tab stop yet: focus goes on to the first row. */
function onFocus(event: FocusEvent) {
  if (event.target === root.value) rows().find(enabled)?.focus();
}
</script>

<template>
  <!-- A list or a listbox (the role is bound, so the rule cannot see it) that moves focus between its rows. -->
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
  <div
    ref="root"
    class="e-list"
    :role="mode === 'select' ? 'listbox' : 'list'"
    :aria-label="label"
    :tabindex="stop === undefined && present.size ? 0 : undefined"
    @keydown="onKeydown"
    @focus="onFocus"
  >
    <slot />
  </div>
</template>

<style>
@layer e.blocks {
  /* A column of rows with a hair of space between them, so neighbouring rows' edges never touch. */
  .e-list {
    display: grid;
    gap: var(--e-pad-inset);
    min-width: 0;
  }

  .e-list:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: calc(-1 * var(--e-stroke-focus));
  }
}
</style>
