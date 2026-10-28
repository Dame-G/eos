<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";
import type { IconProp } from "../../icons/types.js";
import type { Tone } from "../../types.js";
import "../../styles/base.css";
import "../Heading/scale.css";

withDefaults(
  defineProps<{
    /** An icon above the title. */
    icon?: IconProp;
    /** What is missing, in the person's words. */
    title: string;
    /** The level of the title's heading element, 1 to 6, chosen to fit the page outline. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Removes the outline, for use inside a table or panel. */
    bare?: boolean;
    /** `danger` colours the icon in the error colour, for a failed load or a search that broke rather than one that found nothing. `neutral` is the default look. */
    tone?: Extract<Tone, "neutral" | "danger">;
    /** `sm` is more compact with a smaller icon, for use inside a panel or a table. */
    size?: "sm" | "md";
    /** Where the parts sit when the container is taller than they are: `center` in the middle, `start` at the top, one under another. */
    align?: "center" | "start";
  }>(),
  { headingLevel: 3, tone: "neutral", size: "md", align: "center" },
);

defineSlots<{
  /** One or two sentences: why it is empty and what to do. */
  default?(): unknown;
  /** The next step, an `EButton`. */
  action?(): unknown;
}>();
</script>

<template>
  <div
    class="e-empty"
    :class="[
      bare && 'e-empty--bare',
      tone === 'danger' && 'e-empty--danger',
      size === 'sm' && 'e-empty--sm',
      align === 'start' && 'e-empty--start',
    ]"
  >
    <span v-if="icon" class="e-empty-icon"><EIcon :name="icon" :size="size === 'sm' ? 'lg' : 'xl'" /></span>
    <component :is="`h${headingLevel}`" class="e-empty-title e-h e-h3">{{ title }}</component>
    <div v-if="$slots.default" class="e-empty-text"><slot /></div>
    <slot name="action" />
  </div>
</template>

<style>
@layer e.containers {
  .e-empty {
    display: grid;
    align-content: center;
    justify-items: center;
    gap: var(--e-gap-base);
    padding-block: calc(var(--e-pad-panel) + var(--e-gap-snug));
    padding-inline: var(--e-pad-card);
    outline: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    border-radius: var(--e-radius-md);
    text-align: center;
  }

  .e-empty--bare {
    outline: 0;
  }

  .e-empty--start {
    align-content: start;
  }

  .e-empty--sm {
    padding-block: var(--e-pad-card);
  }

  .e-empty-icon {
    display: grid;
    place-items: center;
    color: var(--e-primary);
  }

  .e-empty--danger .e-empty-icon {
    color: var(--e-danger);
  }

  /* A div, so the slot may hold paragraphs; they are spaced as blocks in a stack. */
  .e-empty-text {
    display: grid;
    gap: var(--e-gap-snug);
    max-width: var(--e-measure);
    font: var(--e-type-body);
    color: var(--e-muted);
  }

  .e-empty-text > p {
    margin: 0;
  }

  @media (forced-colors: active) {
    .e-empty {
      outline-color: CanvasText;
    }

    .e-empty-icon {
      color: CanvasText;
    }
  }
}
</style>
