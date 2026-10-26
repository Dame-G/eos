<script setup lang="ts" generic="T">
import { computed, inject, onBeforeUnmount, onMounted, ref } from "vue";
import { useVirtualizer } from "@tanstack/vue-virtual";
import { listKey } from "../List/listContext.js";
import { useOverflow } from "../../composables/useOverflow.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** Everything in the list, in order. Only the rows in view (and a few around them) are rendered. */
    items: T[];
    /** The height of a row in pixels: every row's, or the first guess when `measure` is on. */
    rowHeight: number;
    /** Measures each row as it renders, for rows whose height differs or follows the text size. Off, every row is exactly `rowHeight`. */
    measure?: boolean;
    /** What keeps a row's identity as the list changes: a field of the item, or a function of the item and its index. Without it, the index. */
    itemKey?: keyof T | ((item: T, index: number) => string | number);
    /** How many rows to render beyond each end of the view, so a fast scroll or the arrow keys meet rows already there. */
    overscan?: number;
    /** Names the scrolling region, which is then a landmark while it scrolls. Inside an `EList` the list has the name. */
    label?: string;
  }>(),
  { overscan: 4 },
);

defineSlots<{
  /** One row: the item and its index in `items`, such as an `EListRow`. */
  default(props: { item: T; index: number }): unknown;
}>();

const list = inject(listKey, null);
const scroller = ref<HTMLElement | null>(null);
const space = ref<HTMLElement | null>(null);
const overflows = useOverflow(scroller, [space]);

function keyOf(index: number): string | number {
  const item = props.items[index] as T;
  const k = props.itemKey;
  if (typeof k === "function") return k(item, index);
  if (k !== undefined) return item[k] as string | number;
  return index;
}

const virtualizer = useVirtualizer(
  computed(() => ({
    count: props.items.length,
    getScrollElement: () => scroller.value,
    estimateSize: () => props.rowHeight,
    overscan: props.overscan,
    getItemKey: keyOf,
  })),
);

const rows = computed(() => virtualizer.value.getVirtualItems().filter((v) => v.index < props.items.length));
const total = computed(() => virtualizer.value.getTotalSize());

function measureRow(el: unknown) {
  if (props.measure && el instanceof HTMLElement) virtualizer.value.measureElement(el);
}

/** Scrolls row `index` into view, as little as it takes. */
function scrollToIndex(index: number) {
  virtualizer.value.scrollToIndex(index, { align: "auto" });
}

onMounted(() => list?.attachWindow({ count: () => props.items.length, scrollToIndex }));
onBeforeUnmount(() => list?.attachWindow(null));

defineExpose({ scrollToIndex });
</script>

<template>
  <div
    ref="scroller"
    class="e-vlist"
    :class="list && 'e-vlist--list'"
    :role="label && overflows && !list ? 'region' : undefined"
    :aria-label="label && overflows && !list ? label : undefined"
    :tabindex="overflows && !list ? 0 : undefined"
  >
    <div ref="space" class="e-vlist-space" :style="{ blockSize: `${total}px` }">
      <div
        v-for="row in rows"
        :key="row.key as PropertyKey"
        :ref="measureRow"
        class="e-vlist-item"
        :data-index="row.index"
        :style="{ transform: `translateY(${row.start}px)`, blockSize: measure ? undefined : `${rowHeight}px` }"
      >
        <slot :item="items[row.index] as T" :index="row.index" />
      </div>
    </div>
  </div>
</template>

<style>
@layer e.blocks {
  /* The scroller fills the height its parent gives it; set a height on it (or its parent) for it to scroll. */
  .e-vlist {
    block-size: 100%;
    min-block-size: 0;
    overflow: auto;
    overscroll-behavior: contain;
  }

  .e-vlist:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: calc(-1 * var(--e-stroke-focus));
  }

  .e-vlist-space {
    position: relative;
    inline-size: 100%;
  }

  .e-vlist-item {
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
    box-sizing: border-box;
  }

  /* Rows of an EList keep the list's hair of space between them, inside each row's height. */
  .e-vlist--list .e-vlist-item {
    padding-block-end: var(--e-pad-inset);
  }
}
</style>
