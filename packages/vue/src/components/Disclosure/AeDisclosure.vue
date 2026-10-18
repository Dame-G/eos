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

/** Whether it is open. Leave `v-model:open` off and it keeps its own state; set it once to start open. */
const open = defineModel<boolean>("open");

function onToggle(e: Event) {
  open.value = (e.target as HTMLDetailsElement).open;
}
</script>

<template>
  <details
    class="ae-disclosure"
    :class="props.variant === 'card' ? 'ae-acc' : 'ae-details'"
    :name="group"
    :open="open || undefined"
    @toggle="onToggle"
  >
    <summary>
      <template v-if="variant === 'card'">
        <span class="ae-acc-title">{{ title }}</span>
        <span v-if="meta" class="ae-acc-meta">{{ meta }}</span>
      </template>
      <template v-else>{{ title }}</template>
    </summary>
    <div :class="variant === 'card' ? 'ae-acc-body' : 'ae-details-body'"><slot /></div>
  </details>
</template>

<style>
@layer ae.containers {
  .ae-details > summary {
    list-style: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ae-space-3);
    min-height: var(--ae-control-height);
    padding: 0 var(--ae-space-1);
    border-top: var(--ae-stroke-hair) solid var(--ae-border);
    font: 600 var(--ae-text-xs) / 1 var(--ae-font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ae-ink);
  }

  .ae-details > summary::after {
    content: "";
    flex: none;
    width: 8px;
    height: 8px;
    margin-inline-end: 3px;
    border-inline-end: 2px solid currentcolor;
    border-bottom: 2px solid currentcolor;
    transform: translateY(-2px) rotate(45deg);
    transition: transform var(--ae-duration-tap) var(--ae-easing-out);
  }

  .ae-details[open] > summary::after {
    transform: translateY(2px) rotate(-135deg);
  }

  .ae-details > summary::-webkit-details-marker {
    display: none;
  }

  .ae-details > summary:focus-visible {
    outline: var(--ae-stroke-focus) solid var(--ae-focus-ring);
    outline-offset: var(--ae-focus-gap);
  }

  .ae-details > summary:hover {
    color: var(--ae-primary);
  }

  .ae-details[open] > summary {
    margin-bottom: var(--ae-space-3);
  }

  .ae-details-body {
    padding-bottom: var(--ae-space-2);
  }

  .ae-acc > summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ae-space-3);
    min-height: 52px;
    padding: 0 var(--ae-space-4);
    list-style: none;
    cursor: pointer;
    transition: background-color var(--ae-duration-tap) var(--ae-easing-out);
  }

  .ae-acc > summary::-webkit-details-marker {
    display: none;
  }

  .ae-acc > summary::after {
    content: "";
    flex: none;
    width: 8px;
    height: 8px;
    margin-inline-end: 3px;
    border-inline-end: 2px solid currentcolor;
    border-bottom: 2px solid currentcolor;
    transform: translateY(-2px) rotate(45deg);
  }

  .ae-acc[open] > summary::after {
    transform: translateY(2px) rotate(-135deg);
  }

  .ae-acc > summary:hover {
    background: var(--ae-surface-tint);
  }

  .ae-acc > summary:focus-visible {
    outline: var(--ae-stroke-focus) solid var(--ae-focus-ring);
    outline-offset: -2px;
  }

  .ae-acc-title {
    flex: 1;
    font: 500 var(--ae-text-md) / 1.3 var(--ae-font-sans);
  }

  .ae-acc-meta {
    font: 500 var(--ae-text-xs) / 1 var(--ae-font-mono);
    color: var(--ae-muted);
  }

  .ae-acc-body {
    padding: var(--ae-space-2) var(--ae-space-4) var(--ae-space-4);
    font: 400 var(--ae-text-md) / 1.5 var(--ae-font-sans);
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-details > summary::after,
    .ae-acc > summary {
      transition: none;
    }
  }
}
</style>
