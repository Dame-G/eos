<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";
import type { IconProp } from "../../icons/types.js";
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
  }>(),
  { headingLevel: 3 },
);

defineSlots<{
  /** One or two sentences: why it is empty and what to do. */
  default?(): unknown;
  /** The next step, an `EButton`. */
  action?(): unknown;
}>();
</script>

<template>
  <div class="e-empty" :class="bare && 'e-empty--bare'">
    <span v-if="icon" class="e-empty-icon"><EIcon :name="icon" /></span>
    <component :is="`h${headingLevel}`" class="e-empty-title e-h e-h3">{{ title }}</component>
    <p v-if="$slots.default" class="e-empty-text"><slot /></p>
    <slot name="action" />
  </div>
</template>

<style>
@layer e.containers {
  .e-empty {
    display: grid;
    justify-items: center;
    gap: var(--e-space-2);
    padding-block: var(--e-space-8);
    padding-inline: var(--e-space-4);
    outline: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    border-radius: var(--e-radius-md);
    text-align: center;
  }

  .e-empty--bare {
    outline: 0;
  }

  .e-empty-icon {
    display: grid;
    place-items: center;
    margin-bottom: var(--e-space-1);
    color: var(--e-primary);
  }

  .e-empty-icon .e-icon {
    width: var(--e-icon-size-lg);
    height: var(--e-icon-size-lg);
  }

  .e-empty-text {
    margin: 0;
    margin-block-end: var(--e-space-2);
    max-width: 38ch;
    font: var(--e-weight-regular) var(--e-text-md) / 1.5 var(--e-font-sans);
    color: var(--e-muted);
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
