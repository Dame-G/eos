<script setup lang="ts">
import { useMessages } from "../../config.js";
import "../../styles/base.css";

defineProps<{
  /** The id the input's `aria-describedby` points at. */
  id: string;
  /** How many characters there are. */
  count: number;
  /** The `maxlength`, when there is one. */
  max?: number | undefined;
}>();

const t = useMessages();
</script>

<template>
  <p :id="id" class="e-field-count" :data-full="max && count >= max ? '' : undefined">
    {{ max ? t("charCount", { n: count, max }) : t("charCountOnly", { n: count }) }}
  </p>
</template>

<style>
@layer e.controls {
  .e-field-count {
    margin: 0;
    margin-inline-start: auto;
    font: var(--e-type-small);
    font-variant-numeric: tabular-nums;
    color: var(--e-muted);
  }

  .e-field-count[data-full] {
    color: var(--e-danger);
  }
}
</style>
