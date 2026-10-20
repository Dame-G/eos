<script setup lang="ts">
import { computed, ref, type Component } from "vue";
import EMatchHighlight from "../Combobox/matchHighlight.js";
import "../../styles/base.css";
import "../Select/panel.css";

export interface SearchResultItem {
  /** The title of the result. */
  label: string;
  /** A muted line under the title, such as the section it belongs to. */
  description?: string;
  /** Where it goes. */
  href?: string;
  /** A router location, passed to `linkComponent` as `to` (for `RouterLink`). */
  to?: unknown;
}

const props = withDefaults(
  defineProps<{
    /** The results, best first: `{ label, description?, href?, to? }`. With no `href` or `to` a link goes to `#`. */
    items: SearchResultItem[];
    /** The accessible name of the list, such as "Search results". */
    label: string;
    /** Shown when there are no results, such as `Nothing found for "tax"`. Leave it out to show nothing at all, for example before anyone has typed. */
    emptyText?: string;
    /** The text that was searched for: its first match in each title and description is marked, as in `ECombobox` options. */
    query?: string;
    /** What renders each link: `"a"` by default, or `RouterLink` (or any component that takes `href` or `to` and a default slot). Give items `to`; it receives `to` or `href` and the class `e-opt`. */
    linkComponent?: string | Component;
  }>(),
  { linkComponent: "a" },
);

const emit = defineEmits<{
  /** The person opened a result, by click or Enter. Call `event.preventDefault()` to handle the navigation yourself. */
  select: [item: SearchResultItem, event: MouseEvent];
  /** ArrowUp was pressed on the first result: move focus back to your search box. */
  edge: [];
}>();

const root = ref<HTMLElement | null>(null);
const needle = computed(() => (props.query ?? "").trim().toLowerCase());

const linkAttrs = (item: SearchResultItem) => (item.to !== undefined ? { to: item.to } : { href: item.href ?? "#" });

const links = () => [...(root.value?.querySelectorAll<HTMLElement>(".e-opt") ?? [])];

function focusFirst() {
  links()[0]?.focus();
}

function focus() {
  const all = links();
  (all.find((l) => l.contains(document.activeElement)) ?? all[0])?.focus();
}

function onKeydown(e: KeyboardEvent) {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  const all = links();
  const at = all.findIndex((l) => l === document.activeElement || l.contains(document.activeElement));
  e.preventDefault();
  if (e.key === "ArrowDown") all[Math.min(at + 1, all.length - 1)]?.focus();
  else if (at <= 0) emit("edge");
  else all[at - 1]?.focus();
}

function onClick(item: SearchResultItem, e: MouseEvent) {
  if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  emit("select", item, e);
}

defineExpose({ focus, focusFirst });
</script>

<template>
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
  <div v-if="items.length || emptyText" ref="root" class="e-results" @keydown="onKeydown">
    <ul v-if="items.length" class="e-results-list" :aria-label="label">
      <li v-for="(item, i) in items" :key="i">
        <component :is="linkComponent" class="e-opt" v-bind="linkAttrs(item)" @click="onClick(item, $event)">
          <span class="e-opt-text">
            <span class="e-opt-label"><EMatchHighlight :text="item.label" :query="needle" /></span>
            <span v-if="item.description" class="e-opt-desc">
              <EMatchHighlight :text="item.description" :query="needle" />
            </span>
          </span>
        </component>
      </li>
    </ul>
    <p v-else class="e-opt-status">{{ emptyText }}</p>
  </div>
</template>

<style>
@layer e.controls {
  .e-results {
    max-height: min(24rem, 50vh);
    min-height: 3rem;
    overflow-y: auto;
    padding: var(--e-space-1);
    border-radius: var(--e-radius-md);
    box-shadow: var(--e-edge);
    outline: var(--e-stroke-card) solid var(--e-border-strong);
    outline-offset: 0;
    color: var(--e-ink);
  }

  .e-results-list {
    display: grid;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .e-results .e-opt {
    color: inherit;
    text-decoration: none;
  }

  .e-results .e-opt:hover,
  .e-results .e-opt:focus-visible {
    background: var(--e-surface-hover);
    box-shadow: inset 0 0 0 var(--e-stroke-hair) var(--e-border-strong);
    outline: var(--e-stroke-hair) solid var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-hair));
  }

  .e-results .e-opt:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: calc(-1 * var(--e-stroke-focus));
  }

  @media (forced-colors: active) {
    .e-results .e-opt:hover,
    .e-results .e-opt:focus-visible {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }
}
</style>
