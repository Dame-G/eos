<script setup lang="ts">
import { computed } from "vue";
import "../../styles/base.css";
import "./table.css";

const props = defineProps<{
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
}>();

defineSlots<{
  /** The table's rows: a `thead` and `tbody` (and a `tfoot`). Mark a number column with the class `e-num`. */
  default(): unknown;
}>();

const style = computed(() => (props.maxHeight ? { "--e-table-max-h": props.maxHeight } : undefined));
</script>

<template>
  <div class="e-table-wrap" :class="[striped && 'e-table-wrap--striped', dense && 'e-table-wrap--dense']">
    <div class="e-table-scroll" tabindex="0" role="region" :aria-label="caption" :style="style">
      <table class="e-table">
        <caption :class="hideCaption ? 'e-sr' : 'e-table-caption'">{{ caption }}</caption>
        <slot />
      </table>
    </div>
  </div>
</template>

<style>
@layer e.containers {
  .e-table-wrap {
    position: relative;
    min-width: 0;

    /* The outline is a border outside the scroller and its sticky headings, so nothing covers it, and the fill stops inside it, so the corner carries the edge colour alone. */
    border: var(--e-stroke-card) solid var(--e-border);
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
    background-clip: padding-box;
  }

  .e-table-scroll {
    overflow: auto;
    max-height: var(--e-table-max-h, none);
    border-radius: max(0px, calc(var(--e-radius-md) - var(--e-stroke-card)));
  }

  .e-table-scroll:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: calc(-1 * var(--e-stroke-focus));
  }

  .e-table-wrap .e-table {
    background: var(--e-surface);
  }

  .e-table-caption {
    padding: var(--e-space-3) var(--e-space-4);
    border-bottom: var(--e-stroke-hair) solid var(--e-border);
    text-align: start;
    font: 600 var(--e-text-md) / 1.3 var(--e-font-sans);
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

  @media print {
    .e-table-scroll {
      overflow: visible;
      max-height: none;
    }

    .e-table-wrap {
      border-color: transparent;
    }
  }

  @media (forced-colors: active) {
    .e-table-wrap {
      outline: 1px solid CanvasText;
    }
  }
}
</style>
