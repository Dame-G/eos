<script lang="ts">
import type { LinkItem, LinkSection } from "./LinkNav.vue";

export interface TabItem extends LinkItem {
  /** Names the tab's slot, and is the value of `v-model`. Not needed for a link. */
  id?: string;
  /** A number or short word in a small badge after the label. */
  count?: number | string;
}

export type TabSection = LinkSection<TabItem>;
</script>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch, type Component } from "vue";
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "reka-ui";
import LinkNav from "./LinkNav.vue";
import { useConfig } from "../../config.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The tabs, in order. Two to five for panels; give them `href` or `to` to make a row or column of links. */
    items?: TabItem[];
    /** Links in labelled groups, instead of `items`. */
    sections?: TabSection[];
    /** `vertical` stacks the links with a rule down the start edge, for a sidebar or an outline. Links only. */
    orientation?: "horizontal" | "vertical";
    /** Shorter rows and smaller words, for a long list of links. */
    dense?: boolean;
    /** The landmark's name when the tabs are links. Defaults to "Main". */
    label?: string;
    /** What renders each link: `"a"` by default, or `RouterLink`. */
    linkComponent?: string | Component;
  }>(),
  { orientation: "horizontal", linkComponent: "a" },
);

defineSlots<{
  [id: string]: ((props: { item: TabItem }) => unknown) | undefined;
  /** The panel of any tab that has no slot of its own. */
  panel?(props: { item: TabItem }): unknown;
}>();

const groups = computed<TabSection[]>(() => props.sections ?? [{ items: props.items ?? [] }]);
const flat = computed(() => groups.value.flatMap((g) => g.items));
const isNav = computed(() => flat.value.some((i) => i.href !== undefined || i.to !== undefined));

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
  <LinkNav
    v-if="isNav"
    class="e-tabs e-tabs--links"
    :class="[orientation === 'vertical' && 'e-tabs--vertical', dense && 'e-tabs--dense']"
    :groups="groups"
    :label="label"
    :link-component="linkComponent"
    item-class="e-tab"
    heading-class="e-tabs-heading"
    list-class="e-tablist"
  >
    <template #item="{ item }">
      {{ item.label }}
      <span v-if="item.count != null" class="e-tab-count">{{ item.count }}</span>
    </template>
  </LinkNav>
  <TabsRoot v-else class="e-tabs" :model-value="current" :dir="dir" @update:model-value="model = String($event)">
    <TabsList ref="list" class="e-tablist">
      <TabsTrigger v-for="item in flat" :key="item.id" :value="item.id!" class="e-tab">
        {{ item.label }}
        <span v-if="item.count != null" class="e-tab-count">{{ item.count }}</span>
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="item in flat" :key="item.id" :value="item.id!" class="e-tabpanel">
      <slot :name="item.id!" :item="item"><slot name="panel" :item="item" /></slot>
    </TabsContent>
  </TabsRoot>
</template>

<style>
@layer e.containers {
  .e-tablist {
    display: flex;
    gap: var(--e-space-1);
    /* stylelint-disable-next-line declaration-block-no-redundant-longhand-properties -- the two axes are set apart */
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    border-bottom: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-tablist::-webkit-scrollbar {
    display: none;
  }

  .e-tab + .e-tab::before,
  .e-tablist > li + li > .e-tab::before {
    content: "";
    position: absolute;
    inset-block: 30%;
    inset-inline-start: calc(var(--e-space-1) * -0.5);
    border-inline-start: var(--e-stroke-hair) solid color-mix(in srgb, var(--e-border) 40%, transparent);
  }

  .e-tablist:has(> li) {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .e-tablist > li {
    display: contents;
  }

  a.e-tab {
    text-decoration: none;
  }

  .e-tabs--dense .e-tab {
    height: 2.25rem;
    font-size: var(--e-text-sm);
  }

  .e-tabs--vertical .e-tablist {
    flex-direction: column;
    gap: 0;
    overflow: visible;
    border-bottom: 0;
    border-inline-start: var(--e-stroke-edge) solid var(--e-border);
  }

  .e-tabs--vertical .e-tab {
    background-clip: padding-box;
    justify-content: flex-start;
    height: auto;
    min-height: 2rem;
    margin-inline-start: calc(-1 * var(--e-stroke-edge));
    padding-block: var(--e-space-1);
    border-bottom: 0;
    border-inline-start: 3px solid transparent;
    line-height: 1.35;
    text-align: start;
  }

  .e-tabs--vertical .e-tablist > li > .e-tab::before {
    content: none;
  }

  .e-tabs--vertical.e-tabs--dense .e-tab {
    min-height: 2.25rem;
  }

  .e-tabs--vertical .e-tab[aria-current="page"] {
    border-inline-start-color: var(--e-primary);
    background: var(--e-surface-tint);
  }

  .e-tab {
    position: relative;
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

  .e-tab[aria-selected="true"],
  .e-tab[aria-current="page"] {
    color: var(--e-ink);
    border-bottom-color: var(--e-primary);
    font-weight: 600;
  }

  .e-tab:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: calc(-1 * var(--e-stroke-focus));
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
    .e-tab[aria-selected="true"],
    .e-tab[aria-current="page"] {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }
}
</style>
