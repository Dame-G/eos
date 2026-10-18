<script lang="ts">
export interface TabItem {
  /** Names the tab's slot, and is the value of `v-model`. */
  id: string;
  /** The tab's label. */
  label: string;
  /** A number or short word in a small badge after the label. */
  count?: number | string;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "reka-ui";
import { useConfig } from "../../config.js";
import "../../styles/base.css";

const props = defineProps<{
  /** Two to five tabs, in order. */
  items: TabItem[];
}>();

defineSlots<{
  /** The panel of one tab: the slot is named by the item's `id` (`<template #statements>`). */
  [id: string]: ((props: { item: TabItem }) => unknown) | undefined;
  /** The panel of any tab that has no slot of its own. */
  panel?(props: { item: TabItem }): unknown;
}>();

/** The `id` of the selected tab. The first tab when nothing is bound. */
const model = defineModel<string>();

const config = useConfig();
const current = computed(() => model.value ?? props.items[0]?.id);
// Arrow keys follow the reading direction of the page.
const dir = computed<"ltr" | "rtl">(
  () => config.dir ?? (typeof document !== "undefined" && document.documentElement.dir === "rtl" ? "rtl" : "ltr"),
);
</script>

<template>
  <TabsRoot class="e-tabs" :model-value="current" :dir="dir" @update:model-value="model = String($event)">
    <TabsList class="e-tablist">
      <TabsTrigger v-for="item in items" :key="item.id" :value="item.id" class="e-tab">
        {{ item.label }}
        <span v-if="item.count != null" class="e-tab-count">{{ item.count }}</span>
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="item in items" :key="item.id" :value="item.id" class="e-tabpanel">
      <slot :name="item.id" :item="item"><slot name="panel" :item="item" /></slot>
    </TabsContent>
  </TabsRoot>
</template>

<style>
@layer e.containers {
  .e-tablist {
    display: flex;
    gap: var(--e-space-1);
    /* stylelint-disable-next-line declaration-block-no-redundant-longhand-properties -- the reference writes the two axes apart */
    overflow-x: auto;
    overflow-y: hidden;
    border-bottom: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-tab {
    display: inline-flex;
    align-items: center;
    gap: var(--e-space-2);
    flex: none;
    height: var(--e-control-height);
    padding: 0 var(--e-space-4);
    border: 0;
    border-bottom: 3px solid transparent;
    background: transparent;
    color: var(--e-muted);
    font: 500 var(--e-text-md) / 1 var(--e-font-sans);
    cursor: pointer;
    transition:
      color var(--e-duration-tap) var(--e-easing-out),
      background-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-tab:hover {
    color: var(--e-ink);
    background: var(--e-surface-tint);
  }

  .e-tab[aria-selected="true"] {
    color: var(--e-ink);
    border-bottom-color: var(--e-primary);
    font-weight: 600;
  }

  .e-tab:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: -2px;
    border-radius: var(--e-radius-sm);
  }

  .e-tab-count {
    min-width: 22px;
    padding: 0 6px;
    border-radius: var(--e-radius-pill);
    background: var(--e-surface-tint);
    box-shadow: inset 0 0 0 1px var(--e-border-strong);
    font: 600 var(--e-text-xs) / 20px var(--e-font-mono);
    text-align: center;
    color: var(--e-ink);
  }

  .e-tabpanel {
    padding-top: var(--e-space-4);
  }

  @media (prefers-reduced-motion: reduce) {
    .e-tab {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .e-tab[aria-selected="true"] {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }
}
</style>
