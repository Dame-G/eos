<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

export interface Step {
  /** The name of the step. */
  label: string;
  /** `done` is finished, `current` is where the person is, `upcoming` is still ahead (`todo` is accepted as the same thing), `error` is a step that needs another look. */
  state: "done" | "current" | "upcoming" | "todo" | "error";
  /** Marks a step the person may skip. It says "Optional" under the label. */
  optional?: boolean;
  /** Keeps an `interactive` step from being chosen. It stays in the Tab order, dimmed and marked `aria-disabled`. */
  disabled?: boolean;
}

const props = defineProps<{
  /** The steps in order: `{ label, state, optional?, disabled? }`. `state` is `done`, `current`, `upcoming` (`todo` is an alias) or `error`. Mark one step `current`. Labels of one or two words fit best. */
  steps: Step[];
  /** The list's accessible name. @default "Progress" */
  label?: string;
  /** Makes each step a button that emits `select`, so the person can go back to a step or jump ahead. Leave it off for a display of progress. */
  interactive?: boolean;
  /** `vertical` always stacks the steps in a column, the dot beside its label. `horizontal` always lays them in a row. Left out, the row stacks by itself when the space it is given is narrow. */
  orientation?: "horizontal" | "vertical";
}>();

const emit = defineEmits<{
  /** A step was chosen. Only an `interactive` stepper emits it. */
  select: [index: number, step: Step];
}>();

const t = useMessages();
const stateOf = (step: Step) => (step.state === "todo" ? "upcoming" : step.state);

function choose(index: number, step: Step) {
  if (props.interactive && !step.disabled) emit("select", index, step);
}
</script>

<template>
  <ol class="e-steps" :data-orientation="orientation" :aria-label="label || t('progress')">
    <li
      v-for="(step, i) in steps"
      :key="i"
      class="e-step"
      :data-state="stateOf(step)"
      :aria-current="!interactive && step.state === 'current' ? 'step' : undefined"
    >
      <component
        :is="interactive ? 'button' : 'span'"
        class="e-step-body"
        :type="interactive ? 'button' : undefined"
        :aria-disabled="interactive && step.disabled ? 'true' : undefined"
        :aria-current="interactive && step.state === 'current' ? 'step' : undefined"
        @click="choose(i, step)"
      >
        <span class="e-step-dot">
          <EIcon v-if="step.state === 'done'" name="check" small />
          <EIcon v-else-if="step.state === 'error'" name="alert" small />
          <template v-else>{{ i + 1 }}</template>
        </span>
        <span class="e-step-label">
          {{ step.label }}
          <span v-if="step.state === 'done'" class="e-sr">{{ " " + t("done") }}</span>
          <span v-else-if="step.state === 'error'" class="e-sr">{{ " " + t("stepError") }}</span>
          <span v-if="step.optional" class="e-step-optional">{{ t("optional") }}</span>
        </span>
      </component>
    </li>
  </ol>
</template>

<style>
@layer e.page {
  /* The steps are the container, so they stack when the space they are given is narrow, wherever it is. The dots are raised above the connectors, so the row keeps those layers to itself. */
  .e-steps {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: var(--e-gap-base) var(--e-gap-snug);
    margin: 0;
    padding: 0;
    list-style: none;
    container-type: inline-size;
    isolation: isolate;
  }

  .e-step {
    --_dot: var(--e-icon-size-md);
    --_line: var(--e-border-strong);
    --_inset: var(--e-gap-tight);

    position: relative;
    min-width: 0;
  }

  .e-step-body {
    display: grid;
    justify-items: center;
    align-content: start;
    gap: var(--e-gap-snug);
    box-sizing: border-box;
    width: 100%;
    padding: var(--_inset);
    border: 0;
    border-radius: var(--e-radius-md);
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: center;
    transition: var(--e-transition-state);
  }

  button.e-step-body:not([aria-disabled="true"]) {
    cursor: pointer;
  }

  button.e-step-body:not([aria-disabled="true"]):hover {
    background-color: var(--e-wash-hover);
    box-shadow: var(--e-ring-hover);
  }

  button.e-step-body:not([aria-disabled="true"]):active {
    background-color: var(--e-wash-press);
    box-shadow: var(--e-ring-press);
  }

  button.e-step-body:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-stroke-focus);
  }

  /* A disabled step stays focusable (`aria-disabled`), as a pager's dimmed step does, so Tab still reaches it and reads why it is there. */
  button.e-step-body[aria-disabled="true"] {
    color: var(--e-disabled-ink);
    cursor: not-allowed;
  }

  /* The connector to the step before: a line from the middle of the previous dot to the middle of this one. */
  .e-step::before {
    content: "";
    position: absolute;
    top: calc(var(--_inset) + (var(--_dot) - var(--e-stroke-focus)) / 2);
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

    /* The dot sits `--_inset` inside the step's rounded hover face. */
    border-radius: max(0px, calc(var(--e-radius-md) - var(--_inset)));
    outline: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    background: var(--e-surface);
    background-clip: padding-box;
    color: var(--e-muted);
    font: var(--e-weight-strong) var(--e-text-xs) / var(--e-leading-none) var(--e-font-mono);
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

  .e-step[data-state="error"] .e-step-dot {
    outline: 0;
    border: var(--e-stroke-focus) solid var(--e-danger);
    color: var(--e-danger);
    background-color: var(--e-danger-soft);
    background-clip: padding-box;
  }

  .e-step-label {
    font: var(--e-weight-regular) var(--e-text-sm) / var(--e-leading-snug) var(--e-font-sans);
    color: var(--e-muted);
    overflow-wrap: anywhere;
  }

  .e-step[data-state="current"] .e-step-label {
    color: var(--e-ink);
    font-weight: var(--e-weight-strong);
  }

  .e-step[data-state="done"] .e-step-label,
  .e-step[data-state="error"] .e-step-label {
    color: var(--e-ink);
  }

  .e-step-optional {
    display: block;
    font-size: var(--e-text-xs);
    color: var(--e-muted);
  }

  /* Stacked: one column, the dot beside its label and the connector running down. */
  .e-steps[data-orientation="vertical"] {
    grid-auto-flow: row;
  }

  .e-steps[data-orientation="vertical"] .e-step-body {
    grid-template-columns: auto 1fr;
    place-items: center start;
    text-align: start;
  }

  .e-steps[data-orientation="vertical"] .e-step::before {
    top: calc(-1 * (var(--e-gap-base) + var(--_inset)));
    inset-inline: calc(var(--_inset) + (var(--_dot) - var(--e-stroke-focus)) / 2) auto;
    width: 0;
    height: calc(var(--e-gap-base) + 2 * var(--_inset));
    border-top: 0;
    border-inline-start: var(--e-stroke-focus) solid var(--_line);
  }

  @container (max-width: 32rem) {
    .e-steps:not([data-orientation]) > .e-step {
      grid-column: 1;
    }

    .e-steps:not([data-orientation]) .e-step-body {
      grid-template-columns: auto 1fr;
      place-items: center start;
      text-align: start;
    }

    .e-steps:not([data-orientation]) .e-step::before {
      top: calc(-1 * (var(--e-gap-base) + var(--_inset)));
      inset-inline: calc(var(--_inset) + (var(--_dot) - var(--e-stroke-focus)) / 2) auto;
      width: 0;
      height: calc(var(--e-gap-base) + 2 * var(--_inset));
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
