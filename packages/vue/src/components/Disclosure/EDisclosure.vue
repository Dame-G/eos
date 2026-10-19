<script setup lang="ts">
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The summary line you press to open and close. */
    title: string;
    /** `row` is flush, with a divider above and a mono title. `card` is a roomy row for stacking, as in Accordion. */
    variant?: "row" | "card";
    /** A short note at the right of the summary. Card variant only. */
    meta?: string;
    /** Rows that share a group open one at a time (the native `name` of `details`). */
    group?: string;
  }>(),
  { variant: "row" },
);

defineSlots<{
  /** What opens and closes. */
  default?(): unknown;
}>();

const open = defineModel<boolean>("open");

function onToggle(e: Event) {
  open.value = (e.target as HTMLDetailsElement).open;
}
</script>

<template>
  <details
    class="e-disclosure"
    :class="props.variant === 'card' ? 'e-acc' : 'e-details'"
    :name="group"
    :open="open || undefined"
    @toggle="onToggle"
  >
    <summary>
      <template v-if="variant === 'card'">
        <span class="e-acc-title">{{ title }}</span>
        <span v-if="meta" class="e-acc-meta">{{ meta }}</span>
      </template>
      <template v-else>{{ title }}</template>
    </summary>
    <div :class="variant === 'card' ? 'e-acc-body' : 'e-details-body'"><slot /></div>
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
    padding: var(--e-space-3) 0 0;
    border-top: var(--e-stroke-hair) solid var(--e-border);
    font: 600 var(--e-text-xs) / 1 var(--e-font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--e-ink);
  }

  .e-details > summary::after {
    content: "";
    flex: none;
    width: 8px;
    height: 8px;
    margin-inline-end: 3px;
    border-inline-end: 2px solid currentcolor;
    border-bottom: 2px solid currentcolor;
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
    outline-offset: var(--e-focus-gap);
  }

  .e-details > summary:hover {
    color: var(--e-primary);
  }

  .e-details[open] > summary {
    min-height: 0;
    padding-bottom: var(--e-space-3);
  }

  .e-details-body {
    padding-bottom: var(--e-space-2);
  }

  .e-acc {
    overflow: hidden;
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
    box-shadow: var(--e-edge);
  }

  .e-disclosure.e-acc + .e-disclosure.e-acc {
    margin-top: var(--e-space-2);
  }

  .e-accordion .e-acc {
    border-radius: 0;
    box-shadow: none;
  }

  .e-accordion .e-disclosure.e-acc + .e-disclosure.e-acc {
    margin-top: 0;
  }

  .e-acc[open] > summary {
    border-bottom: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-accordion .e-acc[open] > summary {
    border-bottom: 0;
  }

  .e-acc > summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--e-space-3);
    min-height: 52px;
    padding: 0 var(--e-space-4);
    list-style: none;
    cursor: pointer;
    transition: background-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-acc > summary::-webkit-details-marker {
    display: none;
  }

  .e-acc > summary::after {
    content: "";
    flex: none;
    width: 8px;
    height: 8px;
    margin-inline-end: 3px;
    border-inline-end: 2px solid currentcolor;
    border-bottom: 2px solid currentcolor;
    transform: translateY(-2px) rotate(45deg);
  }

  .e-acc[open] > summary::after {
    transform: translateY(2px) rotate(-135deg);
  }

  .e-acc > summary:hover {
    background: var(--e-surface-tint);
  }

  .e-acc > summary:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: calc(-1 * var(--e-stroke-focus));
  }

  .e-acc-title {
    flex: 1;
    font: 500 var(--e-text-md) / 1.3 var(--e-font-sans);
  }

  .e-acc-meta {
    font: 500 var(--e-text-xs) / 1 var(--e-font-mono);
    color: var(--e-muted);
  }

  .e-acc-body {
    padding: var(--e-space-2) var(--e-space-4) var(--e-space-4);
    font: 400 var(--e-text-md) / 1.5 var(--e-font-sans);
  }

  @media (prefers-reduced-motion: reduce) {
    .e-details > summary::after,
    .e-acc > summary {
      transition: none;
    }
  }
}
</style>
