<script lang="ts">
import type { ListKey } from "../List/listContext.js";

/** One selectable cell of an `ECellRow`. */
export interface CellRowCell {
  /** What names the cell in its `EList`: the list's `v-model` is the `value` of the current or selected cell. Unique in the list. */
  value: ListKey;
  /** What the cell shows. The `cell` slot replaces it. */
  label: string;
  /** The cell's accessible name, when it is more than its text. @default the row's `label` and the cell's `label` */
  name?: string;
  /** Keeps it in the row but unavailable: it dims and no longer answers. */
  disabled?: boolean;
}
</script>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, watch } from "vue";
import { listKey } from "../List/listContext.js";
import "../../styles/base.css";
import "../../styles/listrow.css";

const props = defineProps<{
  /** The number or name that starts the row, such as "12." in a list of moves. It is part of each cell's accessible name. */
  label?: string;
  /** The cells, in order. Each is chosen on its own. */
  cells: readonly CellRowCell[];
  /** How many columns the row keeps, so a row with fewer cells (a game's last move) lines up with the rest. @default the number of cells */
  columns?: number;
}>();

defineSlots<{
  /** A cell's content, instead of its `label`, such as a piece icon and a move. */
  cell?(props: { cell: CellRowCell; index: number; chosen: boolean }): unknown;
}>();

const list = inject(listKey, null);
const select = computed(() => list?.mode.value === "select");
const keys = computed(() => props.cells.map((c) => c.value));

watch(
  keys,
  (now, old) => {
    for (const key of old ?? []) if (!now.includes(key)) list?.unregister(key);
    for (const key of now) list?.register(key);
  },
  { immediate: true },
);
onBeforeUnmount(() => keys.value.forEach((key) => list?.unregister(key)));

const chosen = (cell: CellRowCell) => !!list?.isChosen(cell.value);
const nameOf = (cell: CellRowCell) => cell.name ?? [props.label, cell.label].filter(Boolean).join(" ");

function attrs(cell: CellRowCell) {
  const on = chosen(cell);
  return select.value
    ? { role: "option", "aria-selected": on ? "true" : "false", "aria-disabled": cell.disabled ? "true" : undefined }
    : { type: "button", "aria-current": on ? "true" : undefined, "aria-disabled": cell.disabled ? "true" : undefined };
}

function press(cell: CellRowCell, event: Event) {
  if (cell.disabled) return event.preventDefault();
  list?.choose(cell.value);
}

/** An option is not a button, so Enter and Space choose it here. A button answers them itself. */
function onKeydown(cell: CellRowCell, event: KeyboardEvent) {
  if (!select.value || (event.key !== "Enter" && event.key !== " ")) return;
  event.preventDefault();
  press(cell, event);
}
</script>

<template>
  <!-- An option sits straight in its listbox, so in a `select` list the wrapper has no role. -->
  <div :role="select ? 'none' : 'listitem'" class="e-cellrow" :style="{ '--_n': columns ?? cells.length }">
    <span v-if="label" class="e-cellrow-num" aria-hidden="true">{{ label }}</span>
    <component
      :is="select ? 'div' : 'button'"
      v-for="(cell, i) in cells"
      :key="cell.value"
      class="e-listrow e-cell e-interact--inset"
      v-bind="attrs(cell)"
      :aria-label="nameOf(cell)"
      :tabindex="list ? (list.isStop(cell.value) ? 0 : -1) : undefined"
      @click="press(cell, $event)"
      @keydown="onKeydown(cell, $event)"
      @focus="list?.focused(cell.value)"
    >
      <span class="e-listrow-title"
        ><slot name="cell" :cell="cell" :index="i" :chosen="chosen(cell)">{{ cell.label }}</slot></span
      >
    </component>
  </div>
</template>

<style>
@layer e.blocks {
  /* A number and its cells on one line: the number takes a column of its own, and the cells share the rest equally. */
  .e-cellrow {
    display: grid;
    grid-template-columns: auto repeat(var(--_n, 2), minmax(0, 1fr));
    align-items: center;
    gap: var(--e-pad-inset);
    min-width: 0;
  }

  .e-cellrow-num {
    min-inline-size: 2.5rem;
    padding-inline: var(--e-gap-snug);
    color: var(--e-muted);
    font: var(--e-type-numeral);
    font-variant-numeric: tabular-nums;
    text-align: end;
  }

  /* A cell is a dense row: it keeps the row's states and gives up its height. */
  .e-cell {
    min-height: var(--e-tap);
    padding-block: 0;
    padding-inline: calc(var(--e-gap-snug) - var(--e-stroke-edge));
  }

  /* Without a number the cells start at the first column. */
  .e-cellrow:not(:has(.e-cellrow-num)) {
    grid-template-columns: repeat(var(--_n, 2), minmax(0, 1fr));
  }
}
</style>
