<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

export interface Step {
  /** The name of the step. */
  label: string;
  /** `done` is finished, `current` is where the person is, `upcoming` is still ahead (`todo` is accepted as the same thing). */
  state: "done" | "current" | "upcoming" | "todo";
}

defineProps<{
  /** The steps in order: `{ label, state }`. `state` is `done`, `current` or `upcoming` (`todo` is an alias). Mark one step `current`. Labels of one or two words fit best. */
  steps: Step[];
  /** The list's accessible name. @default "Progress" */
  label?: string;
}>();

const t = useMessages();
</script>

<template>
  <ol class="e-steps" :aria-label="label || t('progress')">
    <li
      v-for="(step, i) in steps"
      :key="i"
      class="e-step"
      :data-state="step.state === 'todo' ? 'upcoming' : step.state"
      :aria-current="step.state === 'current' ? 'step' : undefined"
    >
      <span class="e-step-dot">
        <EIcon v-if="step.state === 'done'" name="check" small />
        <template v-else>{{ i + 1 }}</template>
      </span>
      <span class="e-step-label">
        {{ step.label }}
        <span v-if="step.state === 'done'" class="e-sr"> ({{ t("done") }})</span>
      </span>
    </li>
  </ol>
</template>

<style>
@layer e.page {
  /* The steps are the container, so they stack when the space they are given is narrow, wherever it is. */
  .e-steps {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: var(--e-space-3) var(--e-space-2);
    margin: 0;
    padding: 0;
    list-style: none;
    container-type: inline-size;
  }

  .e-step {
    --_dot: var(--e-icon-size-md);
    --_line: var(--e-border-strong);

    display: grid;
    justify-items: center;
    align-content: start;
    gap: var(--e-space-2);
    position: relative;
    text-align: center;
    min-width: 0;
  }

  /* The connector to the step before: a line from the middle of the previous dot to the middle of this one. */
  .e-step::before {
    content: "";
    position: absolute;
    top: calc((var(--_dot) - var(--e-stroke-focus)) / 2);
    inset-inline-end: 50%;
    width: 100%;
    border-top: var(--e-stroke-focus) solid var(--_line);
    z-index: 0;
  }

  .e-step:first-child::before {
    display: none;
  }

  .e-step[data-state="done"],
  .e-step[data-state="current"] {
    --_line: var(--e-primary);
  }

  .e-step-dot {
    position: relative;
    z-index: var(--e-z-raised);
    display: grid;
    place-items: center;
    width: var(--_dot);
    height: var(--_dot);
    box-sizing: border-box;
    border: var(--e-stroke-edge) solid transparent;
    border-radius: var(--e-radius-md);
    outline: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    background: var(--e-surface);
    background-clip: padding-box;
    color: var(--e-muted);
    font: var(--e-weight-strong) var(--e-text-xs) / 1 var(--e-font-mono);
  }

  .e-step[data-state="done"] .e-step-dot {
    outline: 0;
    border-color: var(--e-primary);
    background: var(--e-primary);
    color: var(--e-on-primary);
  }

  .e-step[data-state="current"] .e-step-dot {
    outline: 0;
    border: var(--e-stroke-focus) solid var(--e-primary);
    color: var(--e-primary);
    background-color: var(--e-primary-soft);
    background-clip: padding-box;
  }

  .e-step-label {
    font: var(--e-weight-regular) var(--e-text-sm) / 1.3 var(--e-font-sans);
    color: var(--e-muted);
    overflow-wrap: anywhere;
  }

  .e-step[data-state="current"] .e-step-label {
    color: var(--e-ink);
    font-weight: var(--e-weight-strong);
  }

  .e-step[data-state="done"] .e-step-label {
    color: var(--e-ink);
  }

  /* A narrow container stacks the steps in one column, the dot beside its label and the connector running down. */
  @container (max-width: 32rem) {
    .e-step {
      grid-column: 1;
      grid-template-columns: auto 1fr;
      place-items: center start;
      text-align: start;
    }

    .e-step::before {
      top: calc(-1 * var(--e-space-3));
      inset-inline: calc((var(--_dot) - var(--e-stroke-focus)) / 2) auto;
      width: 0;
      height: var(--e-space-3);
      border-top: 0;
      border-inline-start: var(--e-stroke-focus) solid var(--_line);
    }
  }

  @media (forced-colors: active) {
    .e-step[data-state="done"] .e-step-dot {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }
}
</style>
