<script lang="ts">
export interface TabItem {
  /** Names the tab's panel slot (`panel-<id>`), and is the value of `v-model`. */
  id: string;
  /** The tab's words. */
  label: string;
  /** A number or short word in a small badge after the label. */
  count?: number | string;
  /** Not choosable. The tab stays in the row, dimmed, and arrow keys skip it. */
  disabled?: boolean;
}
</script>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useSlots, watch } from "vue";
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "reka-ui";
import { useDir } from "../../composables/useDir.js";
import "../../styles/base.css";

const props = defineProps<{
  /** The tabs, in order: `{ id, label, count?, disabled? }`. Two to five across, with short labels. A vertical list can be longer. `id` is the `v-model` value and names the `panel-<id>` slot. */
  items?: TabItem[];
  /** Gives every tab an equal share of the width instead of its own. Use it in a narrow container where all tabs must fit. Labels truncate. @default false */
  fill?: boolean;
  /** `vertical` stacks the tabs in a column beside their panel, for a long list of sections or more tabs than fit across. `fill` has no effect. @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** Which side of the panel a `vertical` list sits on: `start` is the left in a left-to-right page, `end` the right. It has no effect on a horizontal row. @default "start" */
  side?: "start" | "end";
  /** Names the row of tabs for screen readers. Needed when a page has more than one set of tabs. */
  label?: string;
}>();

defineSlots<{
  [name: string]: ((props: { item: TabItem }) => unknown) | undefined;
  /** The panel of any tab that has no slot of its own. */
  panel?(props: { item: TabItem }): unknown;
}>();

const slots = useSlots();
const flat = computed(() => props.items ?? []);
/** A panel slot named by the bare id is still read, unless the id is a name the component owns. */
const RESERVED = new Set(["panel", "default"]);
const own = (id: string) => (slots[`panel-${id}`] ? `panel-${id}` : !RESERVED.has(id) && slots[id] ? id : null);

/** The `id` of the selected tab. Keeps its own state when unbound. @default first tab */
const model = defineModel<string>();

/** A model that is absent from the items, or points at a disabled tab, falls back to the first tab that can be chosen. */
const current = computed(() => {
  const chosen = flat.value.find((i) => i.id === model.value && !i.disabled);
  return (chosen ?? flat.value.find((i) => !i.disabled) ?? flat.value[0])?.id;
});

const dir = useDir();

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
    :class="{
      'e-tabs--fill': fill,
      'e-tabs--vertical': orientation === 'vertical',
      'e-tabs--end': orientation === 'vertical' && side === 'end',
    }"
    :orientation="orientation ?? 'horizontal'"
    :model-value="current"
    :dir="dir"
    @update:model-value="model = String($event)"
  >
    <TabsList ref="list" class="e-tablist" :aria-label="label">
      <TabsTrigger v-for="item in flat" :key="item.id" :value="item.id" :disabled="item.disabled" class="e-tab">
        {{ item.label }}
        <span v-if="item.count != null" class="e-tab-count">{{ item.count }}</span>
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="item in flat" :key="item.id" :value="item.id" class="e-tabpanel">
      <slot v-if="own(item.id)" :name="own(item.id)!" :item="item" />
      <slot v-else name="panel" :item="item" />
    </TabsContent>
  </TabsRoot>
</template>

<style>
@layer e.containers {
  /* The tabs raise themselves with z-index; the row is its own stacking context so they never paint over a sticky header. */
  .e-tabs {
    isolation: isolate;
  }

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

  /* Tabs are button-like: every tab is ringed and neighbours sit flush and share an edge, so only the outer ends of the row are rounded. The selected tab rises: its edges thicken to the slab depth and the one along the bottom is the slab, in the primary colour. Every tab is one control height tall either way. */
  .e-tab {
    --_bc: var(--e-border-strong);
    --_lift: 0px;
    --_slab: var(--e-primary);

    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--e-gap-snug);
    flex: none;
    height: var(--e-control-height);
    padding: 0 calc(var(--e-pad-control) - var(--e-stroke-edge));
    border: var(--e-stroke-edge) solid var(--_bc);
    border-bottom-width: calc(var(--e-stroke-edge) + var(--_lift));
    border-radius: 0;
    background: transparent;
    background-clip: padding-box;
    color: var(--e-muted);
    font: var(--e-type-button);
    cursor: pointer;
    transition: var(--e-transition-state);
  }

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

  .e-tab:not([aria-selected="true"], :disabled):hover {
    z-index: var(--e-z-raised);
    color: var(--e-ink);
    background-color: var(--e-wash-hover);
    box-shadow: var(--e-ring-hover);
  }

  .e-tab:not([aria-selected="true"], :disabled):active {
    background-color: var(--e-wash-press);
    box-shadow: var(--e-ring-press);
  }

  .e-tab[aria-selected="true"] {
    --_bc: var(--e-primary);
    --_lift: var(--e-depth);

    z-index: var(--e-z-sticky);
    border-width: calc(var(--e-stroke-edge) + var(--_lift));
    border-bottom-color: var(--_slab);
    background-color: var(--e-surface-hover);
    color: var(--e-primary);
    font-weight: var(--e-weight-strong);
  }

  /* In a vertical list the slab down the outer edge answers the pointer: it darkens under the cursor. In a horizontal list the slab faces the panel, so it holds its colour. */
  .e-tabs--vertical > .e-tablist > .e-tab[aria-selected="true"]:hover {
    --_slab: var(--e-primary-slab);
  }

  .e-tab:focus-visible {
    z-index: var(--e-z-focus);
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-stroke-focus);
  }

  /* Unavailable reads like a disabled button: dashed edge, no fill, quiet text. */
  .e-tab:disabled {
    --_bc: transparent;

    z-index: auto;
    background: var(--e-disabled-fill);
    color: var(--e-disabled-ink);
    outline: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    cursor: not-allowed;
  }

  .e-tabs--fill > .e-tablist {
    overflow-x: hidden;
  }

  .e-tabs--fill > .e-tablist > .e-tab {
    flex: 1 1 0;
    min-width: 0;
    justify-content: center;
    padding-inline: max(0px, calc(var(--e-gap-tight) - var(--e-stroke-edge)));
  }

  /* Equal-width tabs stay equal: the chosen tab's thicker sides come out of its own padding. */
  .e-tabs--fill:not(.e-tabs--vertical) > .e-tablist > .e-tab[aria-selected="true"] {
    padding-inline: max(0px, calc(var(--e-gap-tight) - var(--e-stroke-edge) - var(--_lift)));
  }

  /* Vertical: the tabs stack beside the panel, flush and sharing edges. The selected tab keeps the same thickness on all four sides, with the slab colour down the inline-start side, and only the column's ends are rounded. */
  .e-tabs--vertical {
    display: flex;
    align-items: flex-start;
    gap: var(--e-gap-loose);
  }

  .e-tabs--vertical > .e-tablist {
    flex-direction: column;
    flex: none;
    overflow: visible;
  }

  .e-tabs--vertical > .e-tablist > .e-tab {
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
    border-bottom-color: var(--_bc);
    border-inline-start-color: var(--_slab);
  }

  .e-tabs--vertical > .e-tabpanel {
    flex: 1 1 0;
    min-width: 0;
    padding-block-start: 0;
  }

  /* The list on the inline-end side: the same column, mirrored, with the slab down the outer edge. */
  .e-tabs--vertical.e-tabs--end {
    flex-direction: row-reverse;
  }

  .e-tabs--vertical.e-tabs--end > .e-tablist > .e-tab[aria-selected="true"] {
    border-inline-start-color: var(--_bc);
    border-inline-end-color: var(--_slab);
  }

  .e-tab-count {
    min-width: var(--e-gap-section);
    padding: 0 var(--e-gap-snug);
    border-radius: var(--e-radius-pill);
    border: var(--e-stroke-hair) solid var(--e-primary);
    background: var(--e-primary-soft);
    background-clip: padding-box;
    font: var(--e-weight-strong) var(--e-text-xs) / calc(5 / 3) var(--e-font-mono);
    text-align: center;
    color: var(--e-ink);
  }

  .e-tabpanel {
    padding-block-start: var(--e-gap-loose);
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
