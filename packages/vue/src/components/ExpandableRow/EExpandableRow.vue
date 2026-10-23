<script setup lang="ts">
import EActions from "../Actions/EActions.vue";
import "../../styles/base.css";

defineProps<{
  /** The row's name, always visible in the summary. */
  title: string;
  /** A muted line under the title. */
  subtitle?: string;
  /** Rows that share a `group` open one at a time (the native `name` of `details`). */
  group?: string;
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

function onToggle(e: Event) {
  open.value = (e.target as HTMLDetailsElement).open;
}
</script>

<template>
  <details class="e-xrow" :name="group" :open="open || undefined" @toggle="onToggle">
    <!-- A summary holds phrasing content only, so the parts are spans that CSS lays out as blocks. -->
    <summary :class="{ 'e-xrow-summary--lead': $slots.leading }">
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
  .e-xrow {
    --_band: var(--e-border);

    container-type: inline-size;
    border-bottom: var(--e-depth) solid transparent;
    border-radius: var(--e-radius-md);
    background-color: var(--e-surface);
    background-image: linear-gradient(to top, var(--_band) var(--e-depth), transparent var(--e-depth));
    background-origin: border-box;
    background-repeat: no-repeat;
    box-shadow: var(--e-frame);
    transition:
      background-color var(--e-duration-tap) var(--e-easing-out),
      box-shadow var(--e-duration-tap) var(--e-easing-out);
  }

  .e-xrow:not([open]):hover {
    --_band: var(--e-border-strong);

    background-color: var(--e-surface-hover);
    box-shadow: 0 0 0 var(--e-stroke-card) var(--e-border-strong);
  }

  .e-xrow[open] {
    border-bottom-width: 0;
    background-image: none;
    box-shadow: var(--e-frame);
  }

  .e-xrow[open]:has(> summary:hover) {
    background-color: var(--e-surface-hover);
    box-shadow: 0 0 0 var(--e-stroke-card) var(--e-border-strong);
  }

  .e-xrow[open] > summary:hover {
    border-bottom-color: var(--e-border-strong);
  }

  .e-xrow > summary {
    border-radius: var(--e-radius-md);
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--e-space-3);
    padding-block: var(--e-space-3);
    padding-inline: var(--e-space-4);
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
    display: block;
    min-width: 0;
  }

  .e-xrow-title {
    display: block;
    font: var(--e-weight-medium) var(--e-text-md) / 1.3 var(--e-font-sans);
    overflow-wrap: anywhere;
    text-wrap: balance;
  }

  .e-xrow-sub {
    display: block;
    margin-block-start: var(--e-space-1);
    font: var(--e-weight-regular) var(--e-text-sm) / 1.4 var(--e-font-sans);
    color: var(--e-muted);
    overflow-wrap: anywhere;
  }

  .e-xrow-trail {
    min-width: 5.5rem;
    font: var(--e-weight-medium) var(--e-text-md) / 1.3 var(--e-font-mono);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    text-align: end;
  }

  .e-xrow[open] > summary {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
    border-bottom: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-xrow-body {
    container-type: inline-size;
    border-end-start-radius: var(--e-radius-md);
    border-end-end-radius: var(--e-radius-md);
  }

  .e-xrow-content {
    display: grid;
    gap: var(--e-space-2);
    padding: var(--e-space-4);
  }

  .e-xrow-body > .e-actions--bar:last-child {
    border-end-start-radius: var(--e-radius-md);
    border-end-end-radius: var(--e-radius-md);
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
