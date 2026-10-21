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
  /** The steps in order: `{ label, state }`; `state` is `done`, `current` or `upcoming` (`todo` is an alias). Exactly one is normally `current`. Keep labels to one or two words. */
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
  .e-steps {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: var(--e-space-2);
    margin: 0;
    padding: 0;
    list-style: none;
    counter-reset: s;
  }

  .e-step {
    --e-dot: 28px;

    display: grid;
    justify-items: center;
    align-content: start;
    gap: var(--e-space-2);
    position: relative;
    text-align: center;
    min-width: 0;
  }

  .e-step::before {
    content: "";
    position: absolute;
    top: calc((var(--e-dot) - var(--e-stroke-focus)) / 2);
    inset-inline-end: 50%;
    width: 100%;
    border-top: var(--e-stroke-focus) solid var(--e-border-strong);
    z-index: 0;
  }

  .e-step:first-child::before {
    display: none;
  }

  .e-step[data-state="done"]::before {
    border-top-color: var(--e-primary);
  }

  .e-step[data-state="current"]::before {
    border-top-color: var(--e-primary);
  }

  .e-step-dot {
    position: relative;
    z-index: var(--e-z-raised);
    display: grid;
    place-items: center;
    width: var(--e-dot);
    height: var(--e-dot);
    box-sizing: border-box;
    border: var(--e-stroke-edge) solid transparent;
    border-radius: 50%;
    outline: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    background: var(--e-surface);
    background-clip: padding-box;
    color: var(--e-muted);
    font: 600 var(--e-text-xs) / 1 var(--e-font-mono);
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
    background: var(--e-surface);
    background-clip: padding-box;
  }

  .e-step-label {
    font: 400 var(--e-text-sm) / 1.3 var(--e-font-sans);
    color: var(--e-muted);
    overflow-wrap: anywhere;
  }

  .e-step[data-state="current"] .e-step-label {
    color: var(--e-ink);
    font-weight: 600;
  }

  .e-step[data-state="done"] .e-step-label {
    color: var(--e-ink);
  }

  /* stylelint-disable declaration-block-no-redundant-longhand-properties -- the longhands stay separate */
  @media (max-width: 32rem) {
    .e-steps {
      grid-auto-flow: row;
      gap: var(--e-space-3);
    }

    .e-step {
      grid-template-columns: auto 1fr;
      justify-items: start;
      align-items: center;
      text-align: start;
    }

    .e-step::before {
      display: block;
      top: calc(-1 * var(--e-space-3));
      inset-inline-end: auto;
      inset-inline-start: calc((var(--e-dot) - var(--e-stroke-focus)) / 2);
      width: 0;
      height: var(--e-space-3);
      border-top: 0;
      border-inline-start: var(--e-stroke-focus) solid var(--e-border-strong);
    }

    .e-step:first-child::before {
      display: none;
    }

    .e-step[data-state="done"]::before {
      border-inline-start-color: var(--e-primary);
    }

    .e-step[data-state="current"]::before {
      border-inline-start-color: var(--e-primary);
    }
  }

  /* stylelint-enable declaration-block-no-redundant-longhand-properties */

  @media (forced-colors: active) {
    .e-step[data-state="done"] .e-step-dot {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }
}
</style>
