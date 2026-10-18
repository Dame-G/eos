<script setup lang="ts">
import AeStack from "../Stack/AeStack.vue";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The question the section answers, such as "Your details". */
    title: string;
    /** A short line under the title. */
    description?: string;
    /** The heading element, 1 to 4. */
    headingLevel?: 1 | 2 | 3 | 4;
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
  <section class="ae-formsection" :aria-labelledby="id">
    <div class="ae-formsection-head">
      <component :is="`h${headingLevel}`" :id="id" class="ae-formsection-title">{{ title }}</component>
      <p v-if="description" class="ae-formsection-desc">{{ description }}</p>
    </div>
    <AeStack :gap="gap"><slot /></AeStack>
  </section>
</template>

<style>
@layer ae.composites {
  .ae-formsection {
    display: grid;
    gap: var(--ae-space-4);
    padding-top: var(--ae-space-6);
    border-top: var(--ae-stroke-hair) solid var(--ae-border);
  }

  .ae-formsection:first-child {
    padding-top: 0;
    border-top: 0;
  }

  .ae-formsection-title {
    margin: 0;
    font: 500 var(--ae-text-xl)/1.25 var(--ae-font-sans);
  }

  .ae-formsection-desc {
    margin: var(--ae-space-1) 0 0;
    max-width: var(--ae-measure);
    font: 400 var(--ae-text-md)/1.45 var(--ae-font-sans);
    color: var(--ae-muted);
  }
}
</style>
