<script setup lang="ts">
import EActions from "../Actions/EActions.vue";
import { useDetails } from "../../composables/useDetails.js";
import "../../styles/base.css";
import "../../styles/details.css";

const props = defineProps<{
  /** The row's name, always visible in the summary. */
  title: string;
  /** A muted line under the title. */
  subtitle?: string;
  /** Rows that share a `group` open one at a time (the native `name` of `details`). */
  group?: string;
  /** Keeps it as it is: the row shows it is unavailable and no longer toggles. */
  disabled?: boolean;
}>();

defineSlots<{
  /** Before the title, such as an `EStamp`, an icon or a date tile. */
  leading?(): unknown;
  /** The value at the end of the summary, such as an amount. It is inside the `summary`, so keep it to text: a button or link here is invalid HTML. */
  trailing?(): unknown;
  /** What the row opens to. */
  default?(): unknown;
  /** Buttons for the bar at the foot of the opened row. */
  actions?(): unknown;
}>();

/** Whether it is open. Without a binding it keeps its own state. */
const open = defineModel<boolean>("open");

const { details, summary } = useDetails(open, { group: () => props.group, disabled: () => props.disabled });
</script>

<template>
  <details class="e-xrow" :class="disabled && 'e-xrow--disabled'" v-bind="details">
    <!-- A summary holds phrasing content only, so the parts are spans that CSS lays out as blocks. -->
    <summary :class="{ 'e-xrow-summary--lead': $slots.leading }" v-bind="summary">
      <span v-if="$slots.leading" class="e-xrow-lead"><slot name="leading" /></span>
      <span class="e-xrow-main">
        <span class="e-xrow-title">{{ title }}</span>
        <span v-if="subtitle" class="e-xrow-sub">{{ subtitle }}</span>
      </span>
      <span v-if="$slots.trailing" class="e-xrow-trail"><slot name="trailing" /></span>
    </summary>
    <div class="e-xrow-body">
      <div v-if="$slots.default" class="e-xrow-content"><slot /></div>
      <EActions v-if="$slots.actions" bar><slot name="actions" /></EActions>
    </div>
  </details>
</template>

<style>
@layer e.containers {
  /* The slab contract: a border on every side, thicker at the bottom by the lift. Hover darkens the edge, press inks it, and opening lays the row flat. */
  .e-xrow {
    --_slab: var(--e-border-strong);
    --_ring: var(--_slab);
    --_lift: var(--e-depth);

    /* How far a child sits inside the row's rounded edge; each child works its own radius from it. */
    --_inset: var(--e-stroke-edge);

    container-type: inline-size;
    border: var(--e-stroke-edge) solid var(--_ring);
    border-bottom-width: calc(var(--e-stroke-edge) + var(--_lift));
    border-radius: var(--e-radius-md);
    background-color: var(--e-surface);
    background-clip: padding-box;
    transition: var(--e-transition-state);
  }

  .e-xrow[open] {
    --_lift: 0px;
  }

  .e-xrow:not([open], .e-xrow--disabled):hover,
  .e-xrow[open]:not(.e-xrow--disabled):has(> summary:hover) {
    --_slab: var(--e-wash-ring);

    background-color: var(--e-wash-hover);
  }

  .e-xrow:not(.e-xrow--disabled):has(> summary:active) {
    --_slab: var(--e-ink);
    --_lift: 0px;

    background-color: var(--e-wash-press);
  }

  .e-xrow--disabled {
    --_lift: 0px;

    background-color: var(--e-disabled-fill);
    color: var(--e-disabled-ink);
  }

  .e-xrow.e-xrow--disabled > summary {
    cursor: not-allowed;
  }

  /* The summary and body sit inside the row's border (edge wide, the bottom edge plus the lift while closed), so their corners are the row's less that. */
  .e-xrow > summary {
    border-start-start-radius: max(0px, calc(var(--e-radius-md) - var(--_inset)));
    border-start-end-radius: max(0px, calc(var(--e-radius-md) - var(--_inset)));
    border-end-start-radius: max(0px, calc(var(--e-radius-md) - var(--_inset) - var(--_lift)));
    border-end-end-radius: max(0px, calc(var(--e-radius-md) - var(--_inset) - var(--_lift)));
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--e-gap-base);
    padding-block: var(--e-pad-control-sm);
    padding-inline: var(--e-pad-card);
    border-bottom: var(--e-stroke-hair) solid transparent;
    list-style: none;
    cursor: pointer;
  }

  /* The lead column is auto. A pattern sets --e-xrow-lead to a fixed width so rows in a list line up. */
  .e-xrow > .e-xrow-summary--lead {
    grid-template-columns: var(--e-xrow-lead, auto) minmax(0, 1fr) auto;
  }

  .e-xrow > summary::-webkit-details-marker {
    display: none;
  }

  .e-xrow > summary:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-stroke-focus);
  }

  .e-xrow-lead {
    display: block;

    /* stylelint-disable-next-line declaration-block-no-redundant-longhand-properties -- two longhands */
    justify-self: start;
    align-self: center;
    min-width: 0;
  }

  .e-xrow-main {
    display: grid;
    gap: var(--e-gap-tight);
    min-width: 0;
  }

  .e-xrow-title {
    display: block;
    font: var(--e-weight-medium) var(--e-text-md) / var(--e-leading-snug) var(--e-font-sans);
    overflow-wrap: anywhere;
    text-wrap: balance;
  }

  .e-xrow-sub {
    display: block;
    font: var(--e-type-small);
    color: var(--e-muted);
    overflow-wrap: anywhere;
  }

  .e-xrow-trail {
    min-width: 5.5rem;
    font: var(--e-weight-medium) var(--e-text-md) / var(--e-leading-snug) var(--e-font-mono);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    text-align: end;
  }

  .e-xrow[open] > summary {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
    border-bottom-color: var(--e-border);
  }

  .e-xrow-body {
    container-type: inline-size;
    border-end-start-radius: max(0px, calc(var(--e-radius-md) - var(--_inset)));
    border-end-end-radius: max(0px, calc(var(--e-radius-md) - var(--_inset)));
  }

  .e-xrow-content {
    display: grid;
    gap: var(--e-gap-snug);
    padding: var(--e-pad-card);
  }

  .e-xrow-body > .e-actions--bar:last-child {
    border-end-start-radius: max(0px, calc(var(--e-radius-md) - var(--_inset)));
    border-end-end-radius: max(0px, calc(var(--e-radius-md) - var(--_inset)));
  }

  @container (max-width: 26rem) {
    .e-xrow > .e-xrow-summary--lead {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
    }

    .e-xrow-summary--lead > .e-xrow-lead {
      grid-column: 1 / -1;
    }
  }

  @media print {
    .e-xrow {
      box-shadow: none;
      outline: 0;
      border: var(--e-stroke-hair) solid var(--e-ink);
      break-inside: avoid;
    }
  }

  @media (forced-colors: active) {
    .e-xrow,
    .e-xrow:not([open]):hover,
    .e-xrow[open]:has(> summary:hover) {
      border-color: CanvasText;
      outline-color: CanvasText;
    }

    .e-xrow > summary:focus-visible {
      outline-color: Highlight;
    }
  }
}
</style>
