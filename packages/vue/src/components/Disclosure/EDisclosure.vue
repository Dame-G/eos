<script setup lang="ts">
import "../../styles/base.css";

defineProps<{
  /** The summary line that opens and closes it. The `title` slot takes rich content. */
  title?: string;
  /** Disclosures that share a `group` open one at a time (the native `name` of `details`). */
  group?: string;
}>();

defineSlots<{
  /** The summary line, in place of the `title` prop. */
  title?(): unknown;
  /** What opens and closes. */
  default?(): unknown;
}>();

/** Whether it is open. Without a binding it keeps its own state. */
const open = defineModel<boolean>("open");

function onToggle(e: Event) {
  open.value = (e.target as HTMLDetailsElement).open;
}
</script>

<template>
  <details class="e-disclosure e-details" :name="group" :open="open || undefined" @toggle="onToggle">
    <summary>
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
    gap: var(--e-space-3);
    min-height: var(--e-control-height);
    padding-block: var(--e-space-3) 0;
    border-block-start: var(--e-stroke-hair) solid var(--e-border);
    font: var(--e-weight-strong) var(--e-text-xs) / 1 var(--e-font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--e-ink);
  }

  .e-details > summary::after {
    content: "";
    flex: none;
    width: var(--e-space-2);
    height: var(--e-space-2);
    margin-inline-end: var(--e-space-1);
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

  .e-details > summary:hover {
    color: var(--e-primary);
  }

  .e-details[open] > summary {
    min-height: 0;
    padding-block-end: var(--e-space-1);
  }

  .e-details-body {
    padding-block-end: var(--e-space-2);
  }

  @media (forced-colors: active) {
    .e-details > summary {
      border-top-color: CanvasText;
      color: CanvasText;
    }

    .e-details > summary:hover {
      color: Highlight;
    }

    .e-details > summary:focus-visible {
      outline-color: Highlight;
    }
  }
}
</style>
