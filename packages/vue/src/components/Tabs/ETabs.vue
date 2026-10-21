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
  /** The tabs, in order: `{ id, label, count? }`. Two to five across, with short labels; a vertical list can be longer. `id` names the slot and is the `v-model` value. */
  items?: TabItem[];
  /** Share the width equally between the tabs instead of letting each take its own. For a narrow container where the tabs must all fit; labels truncate. @default false */
  fill?: boolean;
  /** `vertical` stacks the tabs in a column beside their panel, for a long list of sections. Use it when there are more tabs than fit across; `fill` has no effect. @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** Joins the tabs to their panel so the two read as one card: the panel is outlined, the row of tabs sits on its edge like folder tabs, and the chosen tab opens into the panel with no line between. The edge stays open where there are no tabs. @default false */
  framed?: boolean;
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
  if (props.orientation === "vertical" || !el || !tab || el.scrollWidth <= el.clientWidth) return;
  const calm = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const a = tab.getBoundingClientRect();
  const b = el.getBoundingClientRect();
  el.scrollBy({ left: a.left + a.width / 2 - (b.left + b.width / 2), behavior: smooth && !calm ? "smooth" : "auto" });
}

onMounted(() => reveal(false));
watch(current, () => reveal(true));
</script>

<template>
  <TabsRoot
    class="e-tabs"
    :class="{ 'e-tabs--fill': fill, 'e-tabs--vertical': orientation === 'vertical', 'e-tabs--framed': framed }"
    :orientation="orientation ?? 'horizontal'"
    :model-value="current"
    :dir="dir"
    @update:model-value="model = String($event)"
  >
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
    flex: none;
    gap: 0;
    /* stylelint-disable-next-line declaration-block-no-redundant-longhand-properties -- the two axes are set apart */
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
  }

  .e-tablist::-webkit-scrollbar {
    display: none;
  }

  /* Tabs are button-like: every tab is ringed and neighbours sit flush and share an edge, so only the outer ends of the row are rounded. The selected tab is outlined in the primary colour with a thick slab along its bottom. */
  .e-tab {
    --e-bc: var(--e-border-strong);

    /* A selected tab rises: the slab is a band the tab paints along one edge itself, so there is no second shape behind the corners. Every tab is one control height tall either way. */
    --e-lift: 0px;
    --e-band: calc(var(--e-lift) + var(--e-stroke-edge));
    --e-slab: var(--e-primary);

    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--e-space-2);
    flex: none;
    height: var(--e-control-height);
    padding: 0 var(--e-space-4) var(--e-lift);
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: inset 0 0 0 var(--e-stroke-edge) var(--e-bc);
    color: var(--e-muted);
    font: 500 var(--e-text-md) / 1 var(--e-font-sans);
    cursor: pointer;
    transition:
      color var(--e-duration-tap) var(--e-easing-out),
      background-color var(--e-duration-tap) var(--e-easing-out),
      box-shadow var(--e-duration-tap) var(--e-easing-out);
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
    --e-lift: var(--e-depth);

    z-index: var(--e-z-sticky);
    background-color: color-mix(in srgb, var(--e-surface-tint), var(--e-ink) 3%);
    box-shadow:
      inset 0 0 0 var(--e-stroke-edge) var(--e-bc),
      inset 0 calc(-1 * var(--e-band)) 0 0 var(--e-slab);
    color: var(--e-ink);
    font-weight: 600;
  }

  /* The slab answers the pointer too: it darkens under the cursor, in step with the face. */
  .e-tab[aria-selected="true"]:hover {
    --e-slab: color-mix(in srgb, var(--e-primary), var(--e-shade-slab));
  }

  .e-tab:focus-visible {
    z-index: var(--e-z-focus);
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-focus-gap);
  }

  .e-tabs--fill > .e-tablist {
    overflow-x: hidden;
  }

  .e-tabs--fill > .e-tablist > .e-tab {
    flex: 1 1 0;
    min-width: 0;
    justify-content: center;
    padding-inline: var(--e-space-1);
  }

  /* Vertical: the tabs stack beside the panel, flush and sharing edges. The selected tab rises towards the panel, so its slab is a band down the inline-start side, away from the panel, instead of along the bottom, and only the top and bottom ends of the column are rounded. */
  .e-tabs--vertical {
    display: flex;
    align-items: flex-start;
    gap: var(--e-space-4);
  }

  .e-tabs--vertical > .e-tablist {
    flex-direction: column;
    flex: none;
    overflow: visible;
  }

  .e-tabs--vertical > .e-tablist > .e-tab {
    --e-lift: 0px;

    height: var(--e-control-height);
    padding-block-end: 0;
    justify-content: flex-start;
    border-radius: 0;
  }

  .e-tabs--vertical > .e-tablist > .e-tab:first-child {
    border-start-start-radius: var(--e-radius-md);
    border-start-end-radius: var(--e-radius-md);
  }

  .e-tabs--vertical > .e-tablist > .e-tab:last-child {
    border-end-start-radius: var(--e-radius-md);
    border-end-end-radius: var(--e-radius-md);
  }

  .e-tabs--vertical > .e-tablist > .e-tab + .e-tab {
    margin-inline-start: 0;
    margin-block-start: calc(-1 * var(--e-stroke-edge));
  }

  .e-tabs--vertical > .e-tablist > .e-tab[aria-selected="true"] {
    --e-lift: var(--e-depth);

    padding-inline-start: calc(var(--e-space-4) + var(--e-lift));
    box-shadow:
      inset 0 0 0 var(--e-stroke-edge) var(--e-bc),
      inset var(--e-band) 0 0 0 var(--e-slab);
  }

  .e-tabs--vertical > .e-tabpanel {
    flex: 1 1 0;
    min-width: 0;
    padding-top: 0;
  }

  :dir(rtl) .e-tabs--vertical > .e-tablist > .e-tab[aria-selected="true"] {
    box-shadow:
      inset 0 0 0 var(--e-stroke-edge) var(--e-bc),
      inset calc(-1 * var(--e-band)) 0 0 0 var(--e-slab);
  }

  /* Framed: tabs and panel are one outlined card. The tab row sits over the panel's edge by one stroke, so a tab's lower edge and the panel's upper edge are the same line; the chosen tab has no edge on that side and its fill covers the panel's, opening into it. Tabs sit flush with their neighbours, square where they meet; only the card's outer corner at the first tab is rounded, and the panel's own corner beside it is square. The row always leaves a corner's width of open edge past the last tab, so the panel's curve never lands against a tab's straight edge. */
  .e-tabs--framed > .e-tablist {
    position: relative;
    z-index: var(--e-z-raised);
    margin-block-end: calc(-1 * var(--e-stroke-edge));
  }

  .e-tabs--framed > .e-tablist > .e-tab {
    --e-bc: var(--e-border-strong);
    --e-lift: 0px;

    border-radius: 0;
    background-color: var(--e-surface-tint);
  }

  .e-tabs--framed > .e-tablist > .e-tab:first-child {
    border-start-start-radius: var(--e-radius-md);
  }

  .e-tabs--framed.e-tabs--fill > .e-tablist > .e-tab:last-child {
    border-start-end-radius: var(--e-radius-md);
  }

  .e-tabs:not(.e-tabs--fill, .e-tabs--vertical).e-tabs--framed > .e-tablist {
    padding-inline-end: var(--e-radius-md);
  }

  .e-tabs--framed > .e-tablist > .e-tab:hover {
    background-color: var(--e-surface-hover);
  }

  /* The chosen tab rises like a button does, with its primary slab as a band on the edge away from the panel, and its open sides outlined in the primary colour. */
  .e-tabs--framed > .e-tablist > .e-tab[aria-selected="true"] {
    --e-bc: var(--e-primary);
    --e-lift: var(--e-depth);

    padding-block: var(--e-lift) 0;
    background-color: var(--e-surface);
    box-shadow:
      inset var(--e-stroke-edge) 0 0 0 var(--e-bc),
      inset calc(-1 * var(--e-stroke-edge)) 0 0 0 var(--e-bc),
      inset 0 var(--e-band) 0 0 var(--e-slab);
  }

  .e-tabs--framed > .e-tabpanel {
    padding: var(--e-space-4);
    border-radius: var(--e-radius-md);
    border-start-start-radius: 0;
    background: var(--e-surface);
    box-shadow: inset 0 0 0 var(--e-stroke-edge) var(--e-border-strong);
  }

  .e-tabs--framed.e-tabs--fill > .e-tabpanel {
    border-start-end-radius: 0;
  }

  .e-tabs--framed.e-tabs--vertical {
    gap: 0;
    align-items: stretch;
  }

  .e-tabs--framed.e-tabs--vertical > .e-tablist {
    align-self: flex-start;
    margin-block-end: var(--e-radius-md);
    margin-inline-end: calc(-1 * var(--e-stroke-edge));
  }

  .e-tabs--framed.e-tabs--vertical > .e-tablist > .e-tab {
    border-radius: 0;
  }

  .e-tabs--framed.e-tabs--vertical > .e-tablist > .e-tab:first-child {
    border-start-start-radius: var(--e-radius-md);
  }

  .e-tabs--framed.e-tabs--vertical > .e-tablist > .e-tab[aria-selected="true"] {
    margin-block: calc(-1 * var(--e-stroke-edge)) 0;
    padding-block: 0;
    padding-inline-start: calc(var(--e-space-4) + var(--e-lift));
    box-shadow:
      inset 0 var(--e-stroke-edge) 0 0 var(--e-bc),
      inset 0 calc(-1 * var(--e-stroke-edge)) 0 0 var(--e-bc),
      inset var(--e-band) 0 0 0 var(--e-slab);
  }

  :dir(rtl) .e-tabs--framed.e-tabs--vertical > .e-tablist > .e-tab[aria-selected="true"] {
    box-shadow:
      inset 0 var(--e-stroke-edge) 0 0 var(--e-bc),
      inset 0 calc(-1 * var(--e-stroke-edge)) 0 0 var(--e-bc),
      inset calc(-1 * var(--e-band)) 0 0 0 var(--e-slab);
  }

  .e-tabs--framed.e-tabs--vertical > .e-tablist > .e-tab[aria-selected="true"]:first-child {
    margin-block-start: 0;
  }

  .e-tabs--framed.e-tabs--vertical > .e-tabpanel {
    padding: var(--e-space-4);
  }

  .e-tab-count {
    min-width: var(--e-space-6);
    padding: 0 var(--e-space-2);
    border-radius: var(--e-radius-pill);
    background: color-mix(in srgb, var(--e-primary) 12%, var(--e-surface));
    box-shadow: inset 0 0 0 var(--e-stroke-hair) var(--e-primary);
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
