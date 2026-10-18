<script setup lang="ts">
import AeSurface from "../Surface/AeSurface.vue";
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
  <AeSurface as="section" class="ae-panel">
    <header v-if="title || $slots.action" class="ae-panel-head">
      <div>
        <p v-if="kicker" class="ae-kicker" style="margin: 0">{{ kicker }}</p>
        <component :is="`h${headingLevel}`" v-if="title" class="ae-panel-title">{{ title }}</component>
      </div>
      <slot name="action" />
    </header>
    <div class="ae-panel-body"><slot /></div>
  </AeSurface>
</template>

<style>
@layer ae.containers {
  .ae-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ae-space-3);
    padding: var(--ae-space-3) var(--ae-space-4);
    border-bottom: var(--ae-stroke-hair) solid var(--ae-border);
  }

  .ae-panel-title {
    margin: 0;
    font: 500 var(--ae-text-xl) / 1.25 var(--ae-font-sans);
  }

  .ae-panel-body {
    padding: var(--ae-space-4);
  }

  @media print {
    .ae-panel {
      box-shadow: none;
      border: 1px solid #000;
      break-inside: avoid;
    }
  }
}
</style>
