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
import AeDisclosure from "../Disclosure/AeDisclosure.vue";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

const props = defineProps<{
  /** The sections, in order. Each one's content goes in the slot named by its `id`. */
  items: AccordionItem[];
  /** Lets several sections stay open at once. Otherwise opening one closes the others. */
  multiple?: boolean;
}>();

defineSlots<{
  /** The content of one section: the slot is named by the item's `id` (`<template #billing>`). */
  [id: string]: ((props: { item: AccordionItem }) => unknown) | undefined;
}>();

const group = useUid();
</script>

<template>
  <div class="ae-accordion">
    <AeDisclosure
      v-for="item in props.items"
      :key="item.id"
      variant="card"
      :title="item.title"
      :meta="item.meta"
      :open="item.defaultOpen || undefined"
      :group="multiple ? undefined : group"
    >
      <slot :name="item.id" :item="item" />
    </AeDisclosure>
  </div>
</template>

<style>
@layer ae.containers {
  .ae-accordion {
    border-radius: var(--ae-radius-md);
    box-shadow: var(--ae-edge);
    background: var(--ae-surface);
    overflow: hidden;
  }

  .ae-acc + .ae-acc {
    border-top: var(--ae-stroke-hair) solid var(--ae-border);
  }
}
</style>
