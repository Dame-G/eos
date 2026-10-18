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
  <TabsRoot class="ae-tabs" :model-value="current" :dir="dir" @update:model-value="model = String($event)">
    <TabsList class="ae-tablist">
      <TabsTrigger v-for="item in items" :key="item.id" :value="item.id" class="ae-tab">
        {{ item.label }}
        <span v-if="item.count != null" class="ae-tab-count">{{ item.count }}</span>
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="item in items" :key="item.id" :value="item.id" class="ae-tabpanel">
      <slot :name="item.id" :item="item"><slot name="panel" :item="item" /></slot>
    </TabsContent>
  </TabsRoot>
</template>

<style>
@layer ae.containers {
  .ae-tablist {
    display: flex;
    gap: var(--ae-space-1);
    /* stylelint-disable-next-line declaration-block-no-redundant-longhand-properties -- the reference writes the two axes apart */
    overflow-x: auto;
    overflow-y: hidden;
    border-bottom: var(--ae-stroke-hair) solid var(--ae-border);
  }

  .ae-tab {
    display: inline-flex;
    align-items: center;
    gap: var(--ae-space-2);
    flex: none;
    height: var(--ae-control-height);
    padding: 0 var(--ae-space-4);
    border: 0;
    border-bottom: 3px solid transparent;
    background: transparent;
    color: var(--ae-muted);
    font: 500 var(--ae-text-md) / 1 var(--ae-font-sans);
    cursor: pointer;
    transition:
      color var(--ae-duration-tap) var(--ae-easing-out),
      background-color var(--ae-duration-tap) var(--ae-easing-out);
  }

  .ae-tab:hover {
    color: var(--ae-ink);
    background: var(--ae-surface-tint);
  }

  .ae-tab[aria-selected="true"] {
    color: var(--ae-ink);
    border-bottom-color: var(--ae-primary);
    font-weight: 600;
  }

  .ae-tab:focus-visible {
    outline: var(--ae-stroke-focus) solid var(--ae-focus-ring);
    outline-offset: -2px;
    border-radius: var(--ae-radius-sm);
  }

  .ae-tab-count {
    min-width: 22px;
    padding: 0 6px;
    border-radius: var(--ae-radius-pill);
    background: var(--ae-surface-tint);
    box-shadow: inset 0 0 0 1px var(--ae-border-strong);
    font: 600 var(--ae-text-xs) / 20px var(--ae-font-mono);
    text-align: center;
    color: var(--ae-ink);
  }

  .ae-tabpanel {
    padding-top: var(--ae-space-4);
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-tab {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .ae-tab[aria-selected="true"] {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }
}
</style>
