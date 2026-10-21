<script setup lang="ts">
import EActions from "../Actions/EActions.vue";
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** The page's title: where the person is, in their words ("Visit on Oct 2"). */
    title: string;
    /** A short line under the title. */
    description?: string;
    /** The heading level of the title, 1 by default. A page has exactly one h1; change it only when the header is not the page's title. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  }>(),
  { headingLevel: 1 },
);

defineSlots<{
  /** An EBreadcrumb above the title. */
  breadcrumb?(): unknown;
  /** An EStamp beside the title. */
  status?(): unknown;
  /** The page's Buttons, the main one first. */
  actions?(): unknown;
}>();
</script>

<template>
  <div class="e-pagehead">
    <slot name="breadcrumb" />
    <div class="e-pagehead-row">
      <div class="e-pagehead-text">
        <div class="e-pagehead-titlerow">
          <component :is="`h${headingLevel}`" class="e-pagehead-title">{{ title }}</component>
          <slot name="status" />
        </div>
        <p v-if="description" class="e-pagehead-desc">{{ description }}</p>
      </div>
      <EActions v-if="$slots.actions" class="e-pagehead-actions"><slot name="actions" /></EActions>
    </div>
  </div>
</template>

<style>
@layer e.page {
  .e-pagehead {
    display: grid;
    gap: var(--e-space-3);
    margin-bottom: var(--e-space-6);
  }

  .e-pagehead-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--e-space-3) var(--e-space-4);
  }

  .e-pagehead-text {
    flex: 1 1 18rem;
    min-width: 0;
  }

  .e-pagehead-title {
    margin: 0;
    font: 500 var(--e-text-4xl) / 1.1 var(--e-font-sans);
    text-wrap: balance;
  }

  .e-pagehead-desc {
    margin: var(--e-space-2) 0 0;
    max-width: var(--e-measure);
    font: 400 var(--e-text-lg) / 1.45 var(--e-font-sans);
    color: var(--e-muted);
  }

  @media (max-width: 32rem) {
    .e-pagehead-title {
      font-size: var(--e-text-2xl);
    }
  }

  .e-pagehead-titlerow {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--e-space-2) var(--e-space-4);
  }
}
</style>
