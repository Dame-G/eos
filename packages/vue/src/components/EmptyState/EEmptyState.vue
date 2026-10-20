<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** A glyph in a round badge above the title. */
    icon?: IconProp;
    /** What is missing, in the person's words. */
    title: string;
    /** The level of the title's heading element, 1 to 6; fit the page outline. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Removes the dashed outline, for use inside a table or panel. */
    bare?: boolean;
  }>(),
  { headingLevel: 3 },
);

defineSlots<{
  /** One or two sentences: why it is empty and what to do. */
  default?(): unknown;
  /** The next step, a Button. */
  action?(): unknown;
}>();
</script>

<template>
  <div class="e-empty" :class="bare && 'e-empty--bare'">
    <span v-if="icon" class="e-empty-icon"><EIcon :name="icon" /></span>
    <component :is="`h${headingLevel}`" class="e-empty-title">{{ title }}</component>
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
    padding: var(--e-space-8) var(--e-space-4);
    border: var(--e-stroke-edge) dashed var(--e-border-strong);
    border-radius: var(--e-radius-md);
    text-align: center;
  }

  .e-empty--bare {
    border: 0;
  }

  .e-empty-icon {
    display: grid;
    place-items: center;
    box-sizing: border-box;
    width: 56px;
    height: 56px;
    margin-bottom: var(--e-space-1);
    border-radius: 50%;
    background: var(--e-secondary-soft);
    border: var(--e-stroke-hair) solid var(--e-secondary);

    --e-bc: var(--e-secondary);

    outline: var(--e-stroke-hair) solid var(--e-bc);
    outline-offset: calc(-1 * var(--e-stroke-hair));
  }

  .e-empty-icon .e-icon {
    width: 26px;
    height: 26px;
  }

  .e-empty-title {
    margin: 0;
    font: 500 var(--e-text-xl) / 1.25 var(--e-font-sans);
  }

  .e-empty-text {
    margin: 0 0 var(--e-space-2);
    max-width: 38ch;
    font: 400 var(--e-text-md) / 1.5 var(--e-font-sans);
    color: var(--e-muted);
  }

  @media (forced-colors: active) {
    .e-empty-icon {
      border-color: CanvasText;
      outline-color: CanvasText;
    }
  }
}
</style>
