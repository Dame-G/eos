<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import DialogFrame from "../Dialog/DialogFrame.vue";
import EIcon from "../Icon/EIcon.vue";
import EKbd from "../Kbd/EKbd.vue";
import ESpinner from "../Spinner/ESpinner.vue";
import EMatchHighlight from "../Combobox/matchHighlight.js";
import { fold } from "../Combobox/fold.js";
import type { IconProp } from "../../icons/types.js";
import { useMessages } from "../../config.js";
import { useAnnouncer } from "../../composables/useAnnouncer.js";
import { formatShortcut, useShortcuts } from "../../composables/useShortcuts.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";
import "../Select/panel.css";
import "../Dialog/dialog.css";

export interface CommandItem {
  /** Identifies the command in `select`. Unique in the list. */
  id: string;
  /** The command, written as an action: "Create invoice". */
  label: string;
  /** A line of detail under the label. */
  description?: string;
  /** The heading it is listed under. Commands with no group come first, unlabelled. */
  group?: string;
  /** An icon before the label. */
  icon?: IconProp;
  /** The command's own keyboard shortcut, shown as keycaps (`"mod+n"`). It only displays, so bind it yourself with `useShortcuts`. */
  shortcut?: string;
  /** Extra words that find it without being shown: `["bill", "charge"]`. */
  keywords?: string[];
  /** Shows the command but blocks choosing it. */
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    /** The commands, in the order to list them when nothing is typed. */
    items: CommandItem[];
    /** The palette's accessible name, such as "Command palette". */
    label: string;
    /** Placeholder in the search box. @default "Type a command or search" */
    placeholder?: string;
    /** The shortcut that opens and closes it from anywhere on the page, or `false` for none. Read once when the component is created. */
    shortcut?: string | false;
    /** Whether the palette narrows and orders `items` by what is typed. Turn it off when `items` already is the answer, such as results from a server, and bind `v-model:query` to ask for them. */
    filter?: boolean;
    /** Your own match: return a score above 0 to include the item (higher lists first), or 0 to leave it out. It replaces the built-in matching. `query` is trimmed, lower case and without accents. */
    score?: (item: CommandItem, query: string) => number;
    /** Shows the Searching spinner in the list in place of the commands while a server answers. */
    loading?: boolean;
    /** What the list says when no command matches. @default "No results" */
    emptyText?: string;
  }>(),
  { shortcut: "mod+k", filter: true },
);

const emit = defineEmits<{
  /** The person chose a command, by Enter or click. The palette closes after this. */
  select: [item: CommandItem];
  /** It closed, by a choice, Escape or the backdrop. `open` is already false. */
  close: [];
}>();

defineSlots<{
  /** Replaces a command's row. Keep the text short, because the palette adds the highlight and the `option` role around it. */
  item?(props: { item: CommandItem; active: boolean; query: string }): unknown;
}>();

/** Whether it is open. Without a binding it keeps its own state. */
const open = defineModel<boolean>("open", { default: false });

/** What is typed in the search box. Bind it to fetch results, and set `filter` to false so the palette lists them as they come. It is cleared each time the palette opens. */
const query = defineModel<string>("query", { default: "" });

const t = useMessages();
const { announce } = useAnnouncer();
const uid = useUid();

const activeId = ref<string | null>(null);
const list = ref<HTMLElement | null>(null);

const needle = computed(() => fold(query.value.trim()));

function rank(item: CommandItem, q: string): number {
  if (props.score) return props.score(item, q);
  const tokens = q.split(/\s+/).filter(Boolean);
  if (!tokens.length) return 1;
  const label = fold(item.label);
  const rest = fold([item.description, item.group, ...(item.keywords ?? [])].join(" "));
  let total = 0;
  for (const token of tokens) {
    if (label.startsWith(token)) total += 4;
    else if (label.split(/[\s\-_/]+/).some((w) => w.startsWith(token))) total += 3;
    else if (label.includes(token)) total += 2;
    else if (rest.includes(token)) total += 1;
    else return 0;
  }
  return total;
}

const filtered = computed(() => {
  if (!props.filter) return props.items;
  const q = needle.value;
  const scored = props.items.map((item, i) => ({ item, i, s: rank(item, q) })).filter((x) => x.s > 0);
  if (q) scored.sort((a, b) => b.s - a.s || a.i - b.i);
  return scored.map((x) => x.item);
});

interface Section {
  name: string;
  items: CommandItem[];
}

const sections = computed<Section[]>(() => {
  const out: Section[] = [];
  const byName = new Map<string, Section>();
  for (const item of filtered.value) {
    const name = item.group ?? "";
    let section = byName.get(name);
    if (!section) {
      section = { name, items: [] };
      byName.set(name, section);
      out.push(section);
    }
    section.items.push(item);
  }
  // Ungrouped commands lead, whatever order they matched in.
  return out.sort((a, b) => Number(!!a.name) - Number(!!b.name));
});

/** The commands in the order they are drawn, which is the order the arrow keys walk. */
const flat = computed(() => sections.value.flatMap((s) => s.items));
const choosable = computed(() => flat.value.filter((i) => !i.disabled));

const optionId = (item: CommandItem) => `${uid.value}-${item.id}`;
const activeItem = computed(() => flat.value.find((i) => i.id === activeId.value) ?? null);

watch(flat, () => {
  if (!activeItem.value || activeItem.value.disabled) activeId.value = choosable.value[0]?.id ?? null;
});

watch(
  open,
  (isOpen) => {
    if (isOpen) {
      query.value = "";
      activeId.value = choosable.value[0]?.id ?? null;
    }
  },
  { immediate: true },
);

const emptyMessage = computed(() => props.emptyText || t("noResults"));

function report() {
  if (!choosable.value.length) announce(props.loading ? t("searching") : emptyMessage.value);
  else announce(t("resultsCount", { n: choosable.value.length }));
}

watch(query, () => {
  activeId.value = choosable.value[0]?.id ?? null;
  report();
});

watch(
  () => props.loading,
  (busy) => {
    if (!busy && query.value) report();
  },
);

watch(activeId, async () => {
  await nextTick();
  list.value?.querySelector("[data-active=true]")?.scrollIntoView({ block: "nearest" });
});

function move(delta: number) {
  const all = choosable.value;
  if (!all.length) return;
  const at = all.findIndex((i) => i.id === activeId.value);
  activeId.value = all[(at + delta + all.length) % all.length]!.id;
}

function choose(item: CommandItem | null) {
  if (!item || item.disabled) return;
  emit("select", item);
  open.value = false;
}

function onKeydown(e: KeyboardEvent) {
  if (e.isComposing) return;
  if (e.key === "ArrowDown") move(1);
  else if (e.key === "ArrowUp") move(-1);
  // Without Ctrl, Home and End move the caret in the search box.
  else if (e.key === "Home" && (e.ctrlKey || e.metaKey)) activeId.value = choosable.value[0]?.id ?? null;
  else if (e.key === "End" && (e.ctrlKey || e.metaKey)) activeId.value = choosable.value.at(-1)?.id ?? null;
  else if (e.key === "Enter") choose(activeItem.value);
  else return;
  e.preventDefault();
}

if (props.shortcut) useShortcuts({ [props.shortcut]: () => (open.value = !open.value) });

defineExpose({
  /** Opens the palette. */
  show: () => (open.value = true),
  /** Closes it. */
  hide: () => (open.value = false),
});
</script>

<template>
  <DialogFrame v-model:open="open" bare dismissible :title="label" content-class="e-cmd" @close="emit('close')">
    <div class="e-cmd-search">
      <EIcon name="search" />
      <input
        v-model="query"
        class="e-cmd-input"
        type="text"
        role="combobox"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        aria-expanded="true"
        aria-autocomplete="list"
        :aria-controls="`${uid}-list`"
        :aria-activedescendant="activeItem ? optionId(activeItem) : undefined"
        :aria-label="label"
        :placeholder="placeholder || t('commandPlaceholder')"
        @keydown="onKeydown"
      />
    </div>
    <div
      :id="`${uid}-list`"
      ref="list"
      class="e-cmd-list"
      role="listbox"
      :aria-label="label"
      :aria-busy="loading ? 'true' : undefined"
    >
      <template v-for="(section, si) in sections" :key="section.name">
        <div
          class="e-opt-set"
          :role="section.name ? 'group' : 'presentation'"
          :aria-labelledby="section.name ? `${uid}-g-${si}` : undefined"
        >
          <div v-if="section.name" :id="`${uid}-g-${si}`" class="e-opt-group" role="presentation">
            {{ section.name }}
          </div>
          <!-- Focus stays in the search box (aria-activedescendant), so the options are neither focusable nor keyboard targets. -->
          <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/interactive-supports-focus -->
          <div
            v-for="item in section.items"
            :id="optionId(item)"
            :key="item.id"
            class="e-opt e-cmd-opt"
            :class="{ 'e-opt--active': item.id === activeId, 'e-opt--disabled': item.disabled }"
            role="option"
            :aria-selected="item.id === activeId"
            :aria-disabled="item.disabled || undefined"
            :data-active="item.id === activeId"
            @mousedown.prevent
            @pointermove="!item.disabled && (activeId = item.id)"
            @click="choose(item)"
          >
            <slot name="item" :item="item" :active="item.id === activeId" :query="needle">
              <EIcon v-if="item.icon" :name="item.icon" />
              <span class="e-opt-text">
                <span class="e-opt-label"><EMatchHighlight :text="item.label" :query="needle" /></span>
                <span v-if="item.description" class="e-opt-desc">
                  <EMatchHighlight :text="item.description" :query="needle" />
                </span>
              </span>
              <span v-if="item.shortcut" class="e-cmd-keys" aria-hidden="true">
                <EKbd v-for="key in formatShortcut(item.shortcut)" :key="key" size="sm">{{ key }}</EKbd>
              </span>
            </slot>
          </div>
        </div>
      </template>
      <p v-if="!flat.length" class="e-opt-status" aria-hidden="true">
        <ESpinner v-if="loading" :label="t('searching')" />
        <template v-else>{{ emptyMessage }}</template>
      </p>
    </div>
  </DialogFrame>
</template>

<style>
@layer e.containers {
  .e-cmd {
    position: fixed;
    inset-block-start: min(20dvh, 8rem);
    inset-inline: 0;
    z-index: var(--e-z-modal);
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    width: min(var(--e-size-panel-lg), calc(100vw - var(--e-space-8)));
    max-height: min(26rem, calc(100dvh - 10rem));
    margin-inline: auto;
    overflow: hidden;
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
    color: var(--e-ink);
    box-shadow: var(--e-float);
    font-family: var(--e-font-sans);
  }

  .e-cmd-search {
    display: flex;
    align-items: center;
    gap: var(--e-gap-base);
    padding: 0 var(--e-pad-control);
    border-bottom: var(--e-stroke-hair) solid var(--e-border);
    color: var(--e-muted);
  }

  .e-cmd-input {
    flex: 1;
    min-width: 0;
    height: var(--e-control-height);
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--e-ink);
    font: var(--e-weight-regular) var(--e-text-md) / var(--e-leading-snug) var(--e-font-sans);
  }

  .e-cmd-input::placeholder {
    color: var(--e-muted);
  }

  .e-cmd-list {
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: var(--e-gap-tight);
  }

  .e-cmd-keys {
    display: inline-flex;
    flex: none;
    gap: var(--e-gap-tight);
    margin-inline-start: auto;
  }

  @media (forced-colors: active) {
    .e-cmd {
      outline: var(--e-stroke-edge) solid CanvasText;
    }

    .e-cmd-opt.e-opt--active {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }
}
</style>
