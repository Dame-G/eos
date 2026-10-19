<script lang="ts">
export interface AccordionItem {
  /** Names the item's slot, and keys the list. */
  id: string;
  /** The summary line. */
  title: string;
  /** A short note at the right of the summary. */
  meta?: string;
  /** Starts open. */
  defaultOpen?: boolean;
}
</script>

<script setup lang="ts">
import EDisclosure from "../Disclosure/EDisclosure.vue";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

const props = defineProps<{
  /** The sections, in order. Each one's content goes in the slot named by its `id`. */
  items: AccordionItem[];
  /** Lets several sections stay open at once. Otherwise opening one closes the others. */
  multiple?: boolean;
}>();

defineSlots<{
  [id: string]: ((props: { item: AccordionItem }) => unknown) | undefined;
}>();

const group = useUid();
</script>

<template>
  <div class="e-accordion">
    <EDisclosure
      v-for="item in props.items"
      :key="item.id"
      variant="card"
      :title="item.title"
      :meta="item.meta"
      :open="item.defaultOpen || undefined"
      :group="multiple ? undefined : group"
    >
      <slot :name="item.id" :item="item" />
    </EDisclosure>
  </div>
</template>

<style>
@layer e.containers {
  .e-accordion {
    border-radius: var(--e-radius-md);
    box-shadow: var(--e-edge);
    background: var(--e-surface);
    overflow: hidden;
  }

  .e-accordion > .e-acc + .e-acc {
    border-top: var(--e-stroke-hair) solid var(--e-border);
  }
}
</style>
