<script setup lang="ts">
import { provide } from "vue";
import { ITEM_LIST_KEY } from "./context.js";
import "../../styles/base.css";

defineSlots<{
  /** The `EItemRow`s. */
  default(): unknown;
}>();

provide(ITEM_LIST_KEY, true);
</script>

<template>
  <div class="e-items">
    <div class="e-items-grid" role="list"><slot /></div>
  </div>
</template>

<style>
@layer e.account {
  .e-items {
    container-type: inline-size;
  }

  .e-items-grid {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    column-gap: var(--e-space-3);
  }

  @container (min-width: 36rem) {
    .e-items-grid {
      grid-template-columns: auto minmax(0, 1fr) auto auto;
    }
  }
}
</style>
