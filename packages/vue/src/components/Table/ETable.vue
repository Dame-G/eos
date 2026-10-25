<script setup lang="ts">
import { computed, ref } from "vue";
import EEmptyState from "../EmptyState/EEmptyState.vue";
import "../Skeleton/ESkeleton.vue";
import { useMessages } from "../../config.js";
import { useOverflow } from "../../composables/useOverflow.js";
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
    /** Smaller text and tighter cells, for reference tables with many rows. */
    dense?: boolean;
    /** Stops the table growing past this height (any CSS length) and scrolls inside it, with a sticky header row. */
    maxHeight?: string;
    /** Turns each row into a card below 40rem of the table's own width. Give every `td` a `data-label` with its column heading; a row heading (`th scope="row"`) is the card's title. */
    cards?: boolean;
    /** Marks the data as loading: the rows are dimmed, `aria-busy` is set and placeholder lines show under the table. */
    loading?: boolean;
    /** How many placeholder lines `loading` shows, 5 as in `EDataGrid`. */
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
  { skeletonRows: 5 },
);

defineSlots<{
  /** The table's rows: a `thead` and `tbody` (and a `tfoot`). Mark a number column with the class `e-num`. */
  default(): unknown;
  /** Your own empty state, in place of the title and text, when `empty` is set. */
  empty?(): unknown;
}>();

const t = useMessages();
const style = computed(() => (props.maxHeight ? { "--_max-h": props.maxHeight } : undefined));

// A tab stop that scrolls nothing is noise, so the frame is a focusable, named region only while it scrolls.
const scroller = ref<HTMLElement | null>(null);
const table = ref<HTMLTableElement | null>(null);
const overflows = useOverflow(scroller, [table]);
</script>

<template>
  <div class="e-table-wrap" :class="cards && 'e-cards'">
    <div
      ref="scroller"
      class="e-table-scroll"
      :tabindex="overflows ? 0 : undefined"
      :role="overflows ? 'region' : undefined"
      :aria-label="overflows ? caption : undefined"
      :style="style"
    >
      <table
        ref="table"
        class="e-table"
        :class="{ 'e-table--busy': loading, 'e-table--striped': striped, 'e-table--dense': dense }"
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
      </div>
      <div v-else-if="empty" class="e-table-empty">
        <slot name="empty">
          <EEmptyState bare :icon="emptyIcon || 'search'" :title="emptyTitle || t('noResults')">
            {{ emptyText || t("nothingYet") }}
          </EEmptyState>
        </slot>
      </div>
    </div>
    <!-- Always in the page, so a screen reader hears the text change; a live region that arrives with its text is missed. -->
    <span class="e-sr" role="status">{{ loading ? t("loading") : "" }}</span>
  </div>
</template>

<style>
@layer e.containers {
  .e-table-wrap {
    position: relative;
    min-width: 0;
    border-radius: var(--e-radius-md);
  }

  .e-table-scroll {
    border-radius: inherit;
    background: var(--e-surface);
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

  /* On paper the head is in the flow, so the browser repeats it at the top of each page the table runs onto. */
  @media print {
    .e-table-wrap thead th {
      position: static;
    }
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
}
</style>
