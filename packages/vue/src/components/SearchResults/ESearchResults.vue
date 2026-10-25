<script setup lang="ts">
import { computed, ref, watch, type Component } from "vue";
import EMatchHighlight from "../Combobox/matchHighlight.js";
import { useAnnouncer } from "../../composables/useAnnouncer.js";
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
  /** Identifies the result between updates, so focus stays on it when the list changes. @default href, else the label */
  id?: string;
}

const props = withDefaults(
  defineProps<{
    /** The results, best first: `{ label, description?, href?, to?, id? }`. A result with no `href` or `to` is a button, so `select` is the only way to open it. */
    items: SearchResultItem[];
    /** The accessible name of the list, such as "Search results". */
    label: string;
    /** Shown when there are no results, such as `Nothing found for "tax"`. Without it nothing shows, for example before anyone has typed. */
    emptyText?: string;
    /** The text that was searched for: its first match in each title and description is marked, as in `ECombobox` options. */
    query?: string;
    /** What renders each link: `"a"`, `RouterLink` or any component that takes `href` or `to` and a default slot. It receives `to` or `href` and the class `e-opt`. Give items `to` for `RouterLink`. */
    linkComponent?: string | Component;
  }>(),
  { linkComponent: "a" },
);

const emit = defineEmits<{
  /** The person opened a result, by click or Enter. Calling `event.preventDefault()` lets the app handle the navigation itself. */
  select: [item: SearchResultItem, event: MouseEvent];
  /** ArrowUp was pressed on the first result. Use it to move focus back to the search box. */
  "exit-top": [];
  /** ArrowDown was pressed on the last result. */
  "exit-bottom": [];
}>();

const root = ref<HTMLElement | null>(null);
const needle = computed(() => (props.query ?? "").trim().toLowerCase());

const { announce } = useAnnouncer();
// The empty message is spoken when it appears, since the paragraph is added to the page after the person has typed.
watch(
  () => (!props.items.length ? props.emptyText : undefined),
  (text) => text && announce(text),
  { immediate: true },
);

const linkAttrs = (item: SearchResultItem) =>
  item.to !== undefined ? { to: item.to } : item.href !== undefined ? { href: item.href } : null;

/** A key per result that survives the list changing: its id, href or route, else its label, made unique. */
const keys = computed(() => {
  const seen = new Map<string, number>();
  return props.items.map((item) => {
    const base = item.id ?? item.href ?? (typeof item.to === "string" ? item.to : item.label);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n ? `${base}#${n}` : base;
  });
});

const links = () => [...(root.value?.querySelectorAll<HTMLElement>(".e-opt") ?? [])];

function focusFirst() {
  links()[0]?.focus();
}

function focus() {
  const all = links();
  (all.find((l) => l.contains(document.activeElement)) ?? all[0])?.focus();
}

function onKeydown(e: KeyboardEvent) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
  const all = links();
  const at = all.findIndex((l) => l === document.activeElement || l.contains(document.activeElement));
  e.preventDefault();
  if (e.key === "Home") all[0]?.focus();
  else if (e.key === "End") all[all.length - 1]?.focus();
  else if (e.key === "ArrowDown") {
    if (at >= all.length - 1) emit("exit-bottom");
    else all[at + 1]?.focus();
  } else if (at <= 0) emit("exit-top");
  else all[at - 1]?.focus();
}

// A modified click on a link opens it in a new tab or window, so it is the browser's, not a select. A button has no such meaning.
function onClick(item: SearchResultItem, e: MouseEvent) {
  const modified = e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey;
  if (modified && linkAttrs(item)) return;
  emit("select", item, e);
}

defineExpose({ focus, focusFirst });
</script>

<template>
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
  <div v-if="items.length || emptyText" ref="root" class="e-results" @keydown="onKeydown">
    <ul v-if="items.length" class="e-results-list" :aria-label="label">
      <li v-for="(item, i) in items" :key="keys[i]">
        <component
          :is="linkAttrs(item) ? linkComponent : 'button'"
          class="e-opt"
          v-bind="linkAttrs(item) ?? { type: 'button' }"
          @click="onClick(item, $event)"
        >
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
    min-height: var(--e-tap);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: var(--e-gap-tight);
    border-radius: var(--e-radius-md);
    box-shadow: var(--e-frame);
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
    transition: var(--e-transition-state);
  }

  /* A result with nowhere to go is a button; it looks like the links around it. */
  .e-results button.e-opt {
    width: 100%;
    border: 0;
    background: transparent;
    text-align: start;
  }

  .e-results .e-opt:hover {
    background: var(--e-wash-hover);
    box-shadow: var(--e-ring-hover);
  }

  .e-results .e-opt:active {
    background: var(--e-wash-press);
    box-shadow: var(--e-ring-press);
  }

  .e-results .e-opt:focus-visible {
    background: var(--e-wash-hover);
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
