<script lang="ts">
export interface TabItem {
  /** Names the tab's slot, and is the value of `v-model`. */
  id: string;
  /** The tab's words. */
  label: string;
  /** A number or short word in a small badge after the label. */
  count?: number | string;
}
</script>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "reka-ui";
import { useConfig } from "../../config.js";
import "../../styles/base.css";

const props = defineProps<{
  /** The tabs, in order: `{ id, label, count? }`. Two to five, with short labels. `id` names the slot and is the `v-model` value. */
  items?: TabItem[];
}>();

defineSlots<{
  [id: string]: ((props: { item: TabItem }) => unknown) | undefined;
  /** The panel of any tab that has no slot of its own. */
  panel?(props: { item: TabItem }): unknown;
}>();

const flat = computed(() => props.items ?? []);

/** The `id` of the selected tab. Keeps its own state when unbound. @default first tab */
const model = defineModel<string>();

const config = useConfig();
const current = computed(() => model.value ?? flat.value[0]?.id);
const dir = computed<"ltr" | "rtl">(
  () => config.dir ?? (typeof document !== "undefined" && document.documentElement.dir === "rtl" ? "rtl" : "ltr"),
);

const list = ref<{ $el: HTMLElement } | null>(null);

async function reveal(smooth: boolean) {
  await nextTick();
  const el = list.value?.$el;
  const tab = el?.querySelector<HTMLElement>('[aria-selected="true"]');
  if (!el || !tab || el.scrollWidth <= el.clientWidth) return;
  const calm = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const a = tab.getBoundingClientRect();
  const b = el.getBoundingClientRect();
  el.scrollBy({ left: a.left + a.width / 2 - (b.left + b.width / 2), behavior: smooth && !calm ? "smooth" : "auto" });
}

onMounted(() => reveal(false));
watch(current, () => reveal(true));
</script>

<template>
  <TabsRoot class="e-tabs" :model-value="current" :dir="dir" @update:model-value="model = String($event)">
    <TabsList ref="list" class="e-tablist">
      <TabsTrigger v-for="item in flat" :key="item.id" :value="item.id" class="e-tab">
        {{ item.label }}
        <span v-if="item.count != null" class="e-tab-count">{{ item.count }}</span>
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="item in flat" :key="item.id" :value="item.id" class="e-tabpanel">
      <slot :name="item.id" :item="item"><slot name="panel" :item="item" /></slot>
    </TabsContent>
  </TabsRoot>
</template>

<style>
@layer e.containers {
  .e-tablist {
    display: flex;
    gap: 0;
    /* stylelint-disable-next-line declaration-block-no-redundant-longhand-properties -- the two axes are set apart */
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
  }

  .e-tablist::-webkit-scrollbar {
    display: none;
  }

  /* Tabs are button-like: every tab is ringed and neighbours sit flush and share an edge, so only the outer ends of the row are rounded. The selected tab is outlined in the primary colour with a thick slab underneath. */
  .e-tab {
    --e-bc: var(--e-border-strong);

    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--e-space-2);
    flex: none;
    height: var(--e-control-height);
    padding: 0 var(--e-space-4);
    border: var(--e-stroke-edge) solid var(--e-bc);
    border-radius: 0;
    outline: var(--e-stroke-edge) solid var(--e-bc);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    background: transparent;
    color: var(--e-muted);
    font: 500 var(--e-text-md) / 1 var(--e-font-sans);
    cursor: pointer;
    transition:
      color var(--e-duration-tap) var(--e-easing-out),
      background-color var(--e-duration-tap) var(--e-easing-out);
  }

  /* Only the outer ends of the row are rounded. */
  .e-tab:first-child {
    border-start-start-radius: var(--e-radius-md);
    border-end-start-radius: var(--e-radius-md);
  }

  .e-tab:last-child {
    border-start-end-radius: var(--e-radius-md);
    border-end-end-radius: var(--e-radius-md);
  }

  .e-tab + .e-tab {
    margin-inline-start: calc(-1 * var(--e-stroke-edge));
  }

  .e-tab:hover {
    --e-bc: var(--e-ink);

    z-index: var(--e-z-raised);
    color: var(--e-ink);
    background-color: var(--e-surface-hover);
  }

  .e-tab[aria-selected="true"] {
    --e-bc: var(--e-primary);

    z-index: var(--e-z-sticky);
    border-bottom-width: calc(var(--e-stroke-edge) + var(--e-depth));
    background-color: color-mix(in srgb, var(--e-surface-tint), var(--e-ink) 3%);
    color: var(--e-ink);
    font-weight: 600;
  }

  .e-tab:focus-visible {
    z-index: var(--e-z-focus);
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-focus-gap);
  }

  .e-tab-count {
    min-width: var(--e-space-6);
    padding: 0 var(--e-space-2);
    border-radius: var(--e-radius-pill);
    background: color-mix(in srgb, var(--e-primary) 12%, var(--e-surface));
    box-shadow: inset 0 0 0 var(--e-stroke-hair) var(--e-primary);
    outline: var(--e-stroke-hair) solid var(--e-primary);
    outline-offset: calc(-1 * var(--e-stroke-hair));
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
