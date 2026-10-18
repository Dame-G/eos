<script setup lang="ts">
import ESurface from "../Surface/ESurface.vue";
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** A small mono label above the title. */
    kicker?: string;
    /** The panel's heading. With a title or an `action` the panel gets a header row. */
    title?: string;
    /** The level of the title's heading element, 1 to 6. Pick the one that fits the page outline. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  }>(),
  { headingLevel: 3 },
);

defineSlots<{
  /** The body: statements, detail rows, a form. */
  default?(): unknown;
  /** The header's action, usually a Button. */
  action?(): unknown;
}>();
</script>

<template>
  <ESurface as="section" class="e-panel">
    <header v-if="title || $slots.action" class="e-panel-head">
      <div>
        <p v-if="kicker" class="e-kicker" style="margin: 0">{{ kicker }}</p>
        <component :is="`h${headingLevel}`" v-if="title" class="e-panel-title">{{ title }}</component>
      </div>
      <slot name="action" />
    </header>
    <div class="e-panel-body"><slot /></div>
  </ESurface>
</template>

<style>
@layer e.containers {
  .e-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--e-space-3);
    padding: var(--e-space-3) var(--e-space-4);
    border-bottom: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-panel-title {
    margin: 0;
    font: 500 var(--e-text-xl) / 1.25 var(--e-font-sans);
  }

  .e-panel-body {
    padding: var(--e-space-4);
  }

  @media print {
    .e-panel {
      box-shadow: none;
      border: 1px solid #000;
      break-inside: avoid;
    }
  }
}
</style>
