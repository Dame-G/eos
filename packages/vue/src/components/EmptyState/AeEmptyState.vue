<script setup lang="ts">
import AeIcon from "../Icon/AeIcon.vue";
import type { IconName } from "../../icons/phosphor.js";
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** A glyph in a round badge above the title. */
    icon?: IconName | (string & {});
    /** What is missing, in the person's words. */
    title: string;
    /** The level of the title's heading element, 1 to 6. */
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
  <div class="ae-empty" :class="bare && 'ae-empty--bare'">
    <span v-if="icon" class="ae-empty-icon"><AeIcon :name="icon" /></span>
    <component :is="`h${headingLevel}`" class="ae-empty-title">{{ title }}</component>
    <p v-if="$slots.default" class="ae-empty-text"><slot /></p>
    <slot name="action" />
  </div>
</template>

<style>
@layer ae.containers {
  .ae-empty {
    display: grid;
    justify-items: center;
    gap: var(--ae-space-2);
    padding: var(--ae-space-8) var(--ae-space-4);
    border: var(--ae-stroke-edge) dashed var(--ae-border-strong);
    border-radius: var(--ae-radius-md);
    text-align: center;
  }

  .ae-empty--bare {
    border: 0;
  }

  .ae-empty-icon {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    margin-bottom: var(--ae-space-1);
    border-radius: 50%;
    background: var(--ae-surface-tint);
    box-shadow: inset 0 0 0 1px var(--ae-border-strong);
  }

  .ae-empty-icon .ae-icon {
    width: 26px;
    height: 26px;
  }

  .ae-empty-title {
    margin: 0;
    font: 500 var(--ae-text-xl) / 1.25 var(--ae-font-sans);
  }

  .ae-empty-text {
    margin: 0 0 var(--ae-space-2);
    max-width: 38ch;
    font: 400 var(--ae-text-md) / 1.5 var(--ae-font-sans);
    color: var(--ae-muted);
  }
}
</style>
