<script setup lang="ts">
import { computed, ref } from "vue";
import EEmptyState from "../EmptyState/EEmptyState.vue";
import "../Skeleton/ESkeleton.vue";
import { useMessages } from "../../config.js";
import { useOverflow } from "../../composables/useOverflow.js";
import { useDeprecated, type Size } from "../../composables/useSize.js";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";
import "./table.css";

const props = withDefaults(
  defineProps<{
    /** Names the table for screen readers, and its scrolling region. It is also shown above the table unless `hideCaption` is set. */
    caption: string;
    /** Keeps the caption for screen readers and removes it from the page, for a table that a nearby heading already names. */
    hideCaption?: boolean;
    /** Tints every other row. */
    striped?: boolean;
    /** Smaller text and tighter cells, for reference tables with many rows. `"sm"` is the same as the older `dense`. @default "md" */
    size?: Extract<Size, "sm" | "md">;
    /** @deprecated Use `size="sm"`. */
    dense?: boolean;
    /** Stops the table growing past this height (any CSS length) and scrolls inside it, with a sticky header row. */
    maxHeight?: string;
    /** Turns each row into a card below 40rem of the table's own width. Give every `td` a `data-label` with its column heading. */
    cards?: boolean;
    /** Marks the data as loading: the rows are dimmed, `aria-busy` is set and placeholder lines show under the table. */
    loading?: boolean;
    /** How many placeholder lines `loading` shows. */
    skeletonRows?: number;
    /** Shows the empty state under the headings. Set it when the table has no rows. */
    empty?: boolean;
    /** The title of the empty state. @default "No results" */
    emptyTitle?: string;
    /** The sentence under the empty title. */
    emptyText?: string;
    /** The icon above the empty title. @default "search" */
    emptyIcon?: IconProp;
  }>(),
  { skeletonRows: 3 },
);

defineSlots<{
  /** The table's rows: a `thead` and `tbody` (and a `tfoot`). Mark a number column with the class `e-num`. */
  default(): unknown;
  /** Your own empty state, in place of the title and text, when `empty` is set. */
  empty?(): unknown;
}>();

const t = useMessages();
const style = computed(() => (props.maxHeight ? { "--_max-h": props.maxHeight } : undefined));
useDeprecated("ETable", props, { dense: 'size="sm"' });
const small = computed(() => props.size === "sm" || (!props.size && props.dense));

// A tab stop that scrolls nothing is noise, so the frame is a focusable, named region only while it scrolls.
const scroller = ref<HTMLElement | null>(null);
const table = ref<HTMLTableElement | null>(null);
const overflows = useOverflow(scroller, [table]);
const scrollable = computed(() => overflows.value || !!props.maxHeight);
</script>

<template>
  <div
    class="e-table-wrap"
    :class="[striped && 'e-table-wrap--striped', small && 'e-table-wrap--dense', cards && 'e-cards']"
  >
    <div
      ref="scroller"
      class="e-table-scroll"
      :tabindex="scrollable ? 0 : undefined"
      :role="scrollable ? 'region' : undefined"
      :aria-label="scrollable ? caption : undefined"
      :style="style"
    >
      <table
        ref="table"
        class="e-table"
        :class="{ 'e-table--busy': loading }"
        :aria-busy="loading ? 'true' : undefined"
      >
        <caption :class="hideCaption ? 'e-sr' : 'e-table-caption'">
          {{
            caption
          }}
        </caption>
        <slot />
      </table>
      <div v-if="loading" class="e-table-loading">
        <span v-for="n in skeletonRows" :key="n" class="e-skel" />
        <span class="e-sr" role="status">{{ t("loading") }}</span>
      </div>
      <div v-else-if="empty" class="e-table-empty">
        <slot name="empty">
          <EEmptyState bare :icon="emptyIcon || 'search'" :title="emptyTitle || t('noResults')">
            {{ emptyText || t("nothingYet") }}
          </EEmptyState>
        </slot>
      </div>
    </div>
  </div>
</template>

<style>
@layer e.containers {
  .e-table-wrap {
    position: relative;
    min-width: 0;
    border-radius: var(--e-radius-md);
  }

  /* The outline is drawn once, above the scroller and its sticky headings, so nothing covers it. */
  .e-table-wrap::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    z-index: var(--e-z-sticky);
    box-shadow: inset 0 0 0 var(--e-stroke-card) var(--e-border);
    pointer-events: none;
  }

  .e-table-scroll {
    overflow: auto;
    max-height: var(--_max-h, none);
    border-radius: inherit;
    background: var(--e-surface);
  }

  .e-table-scroll:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: calc(-1 * var(--e-stroke-focus));
  }

  .e-table-caption {
    padding: var(--e-pad-cell);
    border-bottom: var(--e-stroke-hair) solid var(--e-border);
    text-align: start;
    font: var(--e-weight-strong) var(--e-text-md) / var(--e-leading-snug) var(--e-font-sans);
    color: var(--e-ink);
  }

  .e-table-wrap thead th {
    position: sticky;
    top: 0;
    z-index: var(--e-z-raised);
  }

  .e-table-wrap--striped tbody tr:nth-child(even) :is(td, th) {
    background: var(--e-surface-tint);
  }

  .e-table-wrap--striped tbody tr:hover :is(td, th) {
    background: var(--e-surface-hover);
  }

  .e-table-wrap--dense .e-table {
    font-size: var(--e-text-sm);
  }

  .e-table-wrap--dense .e-table :is(th, td, tbody th) {
    padding: var(--e-space-2) var(--e-space-3);
  }

  .e-table--busy tbody {
    opacity: 0.5;
  }

  .e-table-loading {
    display: grid;
    gap: var(--e-gap-base);
    padding: var(--e-pad-cell);
    border-top: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-table-empty {
    border-top: var(--e-stroke-hair) solid var(--e-border);
  }

  @container (max-width: 40rem) {
    .e-cards.e-table-wrap::after {
      content: none;
    }
  }

  @media print {
    .e-table-scroll {
      overflow: visible;
      max-height: none;
    }

    .e-table-wrap::after {
      display: none;
    }
  }

  @media (forced-colors: active) {
    .e-table-wrap {
      outline: 1px solid CanvasText;
    }
  }
}
</style>
