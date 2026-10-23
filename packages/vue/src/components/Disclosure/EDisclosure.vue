<script setup lang="ts">
import { useDetails } from "../../composables/useDetails.js";
import "../../styles/base.css";
import "../../styles/details.css";

const props = defineProps<{
  /** The summary line that opens and closes it. The `title` slot takes rich content. */
  title?: string;
  /** Disclosures that share a `group` open one at a time (the native `name` of `details`). */
  group?: string;
  /** Keeps it as it is: the summary shows it is unavailable and no longer toggles it. */
  disabled?: boolean;
}>();

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
  <details class="e-disclosure e-details" v-bind="details">
    <summary v-bind="summary">
      <slot name="title">{{ title }}</slot>
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
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--e-gap-base);
    min-height: var(--e-control-height);
    padding-block: var(--e-pad-control-sm) 0;
    padding-inline: var(--e-gap-snug);
    border-block-start: var(--e-stroke-hair) solid var(--e-border);
    border-radius: var(--e-radius-sm);
    font: var(--e-type-kicker);
    letter-spacing: var(--e-tracking-label);
    text-transform: uppercase;
    color: var(--e-ink);
    transition: var(--e-transition-state);
  }

  .e-details > summary::after {
    content: "";
    flex: none;
    width: var(--e-gap-snug);
    height: var(--e-gap-snug);
    margin-inline-end: var(--e-gap-tight);
    border-inline-end: var(--e-stroke-card) solid currentcolor;
    border-bottom: var(--e-stroke-card) solid currentcolor;
    transform: translateY(-2px) rotate(45deg);
    transition: transform var(--e-duration-tap) var(--e-easing-out);
  }

  .e-details[open] > summary::after {
    transform: translateY(2px) rotate(-135deg);
  }

  .e-details > summary::-webkit-details-marker {
    display: none;
  }

  .e-details > summary:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-stroke-focus);
  }

  .e-details > summary:not([aria-disabled="true"]):hover {
    background-color: var(--e-wash-hover);
    box-shadow: var(--e-ring-hover);
  }

  .e-details > summary:not([aria-disabled="true"]):active {
    background-color: var(--e-wash-press);
    box-shadow: var(--e-ring-press);
  }

  .e-details > summary[aria-disabled="true"] {
    color: var(--e-disabled-ink);
    cursor: not-allowed;
  }

  .e-details[open] > summary {
    min-height: 0;
    padding-block-end: var(--e-gap-tight);
  }

  .e-details-body {
    padding-block-end: var(--e-gap-snug);
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
