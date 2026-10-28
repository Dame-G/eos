<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";
import { useDetails } from "../../composables/useDetails.js";
import "../../styles/base.css";
import "../../styles/details.css";

const props = withDefaults(
  defineProps<{
    /** The summary line that opens and closes it. The `title` slot takes rich content. */
    title?: string;
    /** Disclosures that share a `group` open one at a time (the native `name` of `details`). */
    group?: string;
    /** Keeps it as it is: the summary shows it is unavailable and no longer toggles it. */
    disabled?: boolean;
    /** How the summary is set: `kicker` in small capitals, as the label of a section, or `text` in the size and weight of a row. */
    titleStyle?: "kicker" | "text";
  }>(),
  { titleStyle: "kicker" },
);

defineSlots<{
  /** The summary line, in place of the `title` prop. */
  title?(): unknown;
  /** What opens and closes. */
  default?(): unknown;
}>();

/** Whether it is open. Without a binding it keeps its own state. */
const open = defineModel<boolean>("open");

const { details, summary } = useDetails(open, { group: () => props.group, disabled: () => props.disabled });
</script>

<template>
  <details class="e-disclosure e-details" :class="titleStyle === 'text' && 'e-details--text'" v-bind="details">
    <summary v-bind="summary">
      <!-- One box for the title, so rich content in it stays one run of text and is not spread across the line. -->
      <span class="e-details-title"
        ><slot name="title">{{ title }}</slot></span
      >
      <EIcon class="e-details-chevron" name="chevron-down" />
    </summary>
    <div class="e-details-body"><slot /></div>
  </details>
</template>

<style>
@layer e.containers {
  .e-details > summary {
    list-style: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--e-gap-base);
    min-height: var(--e-tap);
    padding-block: var(--e-gap-snug);
    padding-inline: var(--e-gap-snug);
    border-block-start: var(--e-stroke-hair) solid var(--e-border);
    font: var(--e-type-kicker);
    letter-spacing: var(--e-tracking-label);
    text-transform: uppercase;
    color: var(--e-ink);
    transition: var(--e-transition-state);
  }

  .e-details > summary::-webkit-details-marker {
    display: none;
  }

  .e-details.e-details--text > summary {
    font: var(--e-weight-medium) var(--e-text-md) / var(--e-leading-snug) var(--e-font-sans);
    letter-spacing: normal;
    text-transform: none;
  }

  /* The summary line answers the pointer with the wash every row uses, and keeps its ink text: no colour change, no underline, no ring. */
  .e-details > summary:not([aria-disabled="true"]):hover {
    background-color: var(--e-wash-hover);
  }

  .e-details > summary:not([aria-disabled="true"]):active {
    background-color: var(--e-wash-press);
  }

  .e-details > summary[aria-disabled="true"] {
    color: var(--e-disabled-ink);
    cursor: not-allowed;
  }

  /* The content is clipped while it slides, and a browser without `overflow-clip-margin` keeps the clip once open: the room at the top keeps the focus ring (or a ring drawn outside a box) of the first thing inside within it. */
  .e-details-body {
    padding-block: calc(2 * var(--e-stroke-focus)) var(--e-gap-snug);
    padding-inline: var(--e-gap-snug);
  }

  @media (forced-colors: active) {
    .e-details > summary {
      border-top-color: CanvasText;
      color: CanvasText;
    }

    .e-details > summary:focus-visible {
      outline-color: Highlight;
    }
  }
}
</style>
