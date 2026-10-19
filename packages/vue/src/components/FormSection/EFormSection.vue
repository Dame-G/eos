<script setup lang="ts">
import EStack from "../Stack/EStack.vue";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The question the section answers, such as "Your details". */
    title: string;
    /** A short line under the title. */
    description?: string;
    /** The heading element, 1 to 4. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Space between the fields: a space token number (1, 2, 3, 4, 6, 8) or any CSS length. */
    gap?: number | string;
    /** The id of the heading; the section is labelled by it. Generated when left out. */
    id?: string;
  }>(),
  { headingLevel: 2, gap: 4 },
);

defineSlots<{
  /** The fields, spaced evenly. */
  default(): unknown;
}>();

const id = useUid(() => props.id);
</script>

<template>
  <section class="e-formsection" :aria-labelledby="id">
    <div class="e-formsection-head">
      <component :is="`h${headingLevel}`" :id="id" class="e-formsection-title">{{ title }}</component>
      <p v-if="description" class="e-formsection-desc">{{ description }}</p>
    </div>
    <EStack :gap="gap"><slot /></EStack>
  </section>
</template>

<style>
@layer e.composites {
  .e-formsection {
    display: grid;
    gap: var(--e-space-4);
    padding-top: var(--e-space-6);
    border-top: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-formsection:first-child {
    padding-top: 0;
    border-top: 0;
  }

  .e-formsection-title {
    margin: 0;
    font: 500 var(--e-text-xl)/1.25 var(--e-font-sans);
  }

  .e-formsection-desc {
    margin: var(--e-space-1) 0 0;
    max-width: var(--e-measure);
    font: 400 var(--e-text-md)/1.45 var(--e-font-sans);
    color: var(--e-muted);
  }
}
</style>
