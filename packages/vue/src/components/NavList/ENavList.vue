<script lang="ts">
/** Navigations mounted on the default name, page-wide, for the development warning. */
let unlabelled = 0;
let warnedUnlabelled = false;
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, type Component } from "vue";
import EIcon from "../Icon/EIcon.vue";
import LinkNavNode, { keyOf, type LinkItem } from "./LinkNavNode.vue";
import { useMessages } from "../../config.js";
import { useUid } from "../../composables/useUid.js";
import { isProduction } from "../../env.js";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";
import "../../styles/count.css";

export interface NavItem extends LinkItem {
  /** An icon before the label. */
  icon?: IconProp;
  /** A count of things waiting on the person (bills to pay, forms to sign). */
  count?: number;
  /** What the count counts, as the phrase a screen reader reads after the label ("2 bills to pay"). Without it the number is read bare. */
  countLabel?: string;
  /** Items under this one. The item becomes a group that opens and closes. Use it in a vertical list. */
  children?: NavItem[];
}

export interface NavSection {
  /** A small heading over the section. Leave it out for a section that needs none. */
  label?: string;
  /** The destinations of the section, in order. */
  items: NavItem[];
}

/** The props of ENavList other than its items or sections. Exported so the built declarations can name it. @public */
export interface NavListOptions {
  /** `vertical` stacks the links, for a sidebar or a menu. `horizontal` lays them in a row, for a header. */
  orientation?: "vertical" | "horizontal";
  /** The landmark's name. Each navigation on a page needs its own; with two left on the default, development warns. @default "Main" */
  label?: string;
  /** What renders each link: `RouterLink` or any component that takes `href` or `to` and a default slot. It receives `to` or `href`, the class `e-nav-item` and `aria-current`. Items then use `to`. */
  linkComponent?: string | Component;
  /** Says which item is the current page, for every item whose `current` is not set: `(item) => item.href === route.path`. It runs again when what it reads changes. */
  isCurrent?: (item: NavItem) => boolean;
  /** `sm` gives short rows with no rule between them, for a long list such as a documentation sidebar. Rows stay a full tap target on a touch screen. */
  size?: "sm" | "md";
}

const props = withDefaults(
  defineProps<
    NavListOptions & {
      /** The destinations, in order: `{ label, href?, to?, icon?, count?, countLabel?, current?, disabled?, children? }`. With no `href` or `to` the item is plain text, not a link. `current` marks the current page and wins over `isCurrent`. Give `items` or `sections`. */
      items?: NavItem[];
      /** Destinations in labelled groups, instead of `items`: `{ label?, items }`. A label is needed only when there is more than one section. */
      sections?: NavSection[];
    } & ({ items: NavItem[] } | { sections: NavSection[] })
  >(),
  { orientation: "vertical", linkComponent: "a", size: "md" },
);

const t = useMessages();
const uid = useUid();
const groups = computed<NavSection[]>(() => props.sections ?? [{ items: props.items ?? [] }]);

/*
 * Two navigations on the default name read as two "Main" landmarks. Development counts the ones mounted without a
 * label and warns once when there is more than one.
 */
if (!isProduction()) {
  onMounted(() => {
    if (props.label) return;
    unlabelled++;
    if (unlabelled > 1 && !warnedUnlabelled) {
      warnedUnlabelled = true;
      console.warn('[eos] More than one ENavList is named "Main". Give each navigation its own `label`.');
    }
  });
  onBeforeUnmount(() => {
    if (!props.label) unlabelled--;
  });
}
/** The recursive node knows only the link fields; every item it hands back is one of ours. */
const nav = (item: LinkItem) => item as NavItem;
const current = (item: LinkItem) => item.current ?? props.isCurrent?.(nav(item)) ?? false;
</script>

<template>
  <nav
    class="e-nav"
    :class="[orientation === 'horizontal' && 'e-nav--horizontal', size === 'sm' && 'e-nav--sm']"
    :aria-label="label || t('mainNav')"
  >
    <template v-for="(group, g) in groups" :key="group.label ?? g">
      <p v-if="group.label" :id="`${uid}-${g}`" class="e-nav-heading">{{ group.label }}</p>
      <ul :aria-labelledby="group.label ? `${uid}-${g}` : undefined">
        <li v-for="(item, i) in group.items" :key="keyOf(item, i)">
          <LinkNavNode :item="item" :link-component="linkComponent" item-class="e-nav-item" :is-current="current">
            <template #item="{ item: node }">
              <EIcon v-if="nav(node).icon" :name="nav(node).icon!" />
              <span class="e-nav-label">{{ node.label }}</span>
              <span
                v-if="nav(node).count != null"
                class="e-count"
                :aria-hidden="nav(node).countLabel ? 'true' : undefined"
                >{{ nav(node).count }}</span
              >
              <span v-if="nav(node).count != null && nav(node).countLabel" class="e-sr"
                >, {{ nav(node).countLabel }}</span
              >
            </template>
          </LinkNavNode>
        </li>
      </ul>
    </template>
  </nav>
</template>

<style>
@layer e.page {
  .e-nav-heading {
    margin-block: var(--e-gap-section) var(--e-gap-snug);
    margin-inline: 0;
    padding-inline: var(--e-pad-control-sm);
    font: var(--e-type-kicker);
    letter-spacing: var(--e-tracking-label);
    text-transform: uppercase;
    color: var(--e-ink);
  }

  /* In a stacked list the heading is underlined by the same hairline that parts the items, full width, so it reads as the head of its section. */
  .e-nav:not(.e-nav--horizontal) .e-nav-heading::after {
    content: "";
    display: block;
    height: var(--e-stroke-hair);
    margin-block-start: var(--e-gap-snug);
    margin-inline: calc(-1 * var(--e-pad-control-sm));
    background: var(--e-border);
  }

  .e-nav > :first-child {
    margin-block-start: 0;
  }

  .e-nav ul {
    display: grid;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .e-nav:not(.e-nav--horizontal) li + li::before {
    content: "";
    display: block;
    height: var(--e-stroke-hair);
    margin-block: var(--e-gap-snug);
    background: var(--e-border);
  }

  /* A row has a clear edge at rest, so the current page can show one without the row changing size. */
  .e-nav-item {
    display: flex;
    align-items: center;
    gap: var(--e-gap-base);
    box-sizing: border-box;
    height: var(--e-control-height);
    padding-block: 0;
    padding-inline: calc(var(--e-pad-control-sm) - var(--e-stroke-edge));
    border: var(--e-stroke-edge) solid transparent;
    border-radius: var(--e-radius-md);
    background-clip: padding-box;
    color: var(--e-ink);
    font: var(--e-weight-regular) var(--e-text-md) / var(--e-leading-none) var(--e-font-sans);
    text-decoration: none;
    transition: var(--e-transition-state);
  }

  /* Where you are: the pastel brand tint with a primary edge and primary text, and no slab (a slab is something to press). The weight stays, so the row does not change width. */
  .e-nav-item[aria-current="page"] {
    border-color: var(--e-primary);
    background-color: var(--e-primary-soft);
    background-clip: padding-box;
    color: var(--e-primary);
  }

  /* A row has its own edge, so it answers the pointer as a bordered item does: the edge darkens and the wash fills inside it. No ring is added, so the hover never reaches past the edge. */
  .e-nav-item:not([aria-current="page"], [aria-disabled="true"]):hover {
    border-color: var(--e-wash-ring);
    background-color: var(--e-wash-hover);
  }

  .e-nav-item:not([aria-current="page"], [aria-disabled="true"]):active {
    border-color: var(--e-ink);
    background-color: var(--e-wash-press);
  }

  /* An unavailable row only dims its text and stops answering the pointer. */
  .e-nav-item[aria-disabled="true"] {
    color: var(--e-disabled-ink);
    cursor: not-allowed;
  }

  .e-nav-summary {
    list-style: none;
    cursor: pointer;
  }

  .e-nav-summary::-webkit-details-marker {
    display: none;
  }

  .e-nav-summary[data-current]:not([aria-disabled="true"]) {
    color: var(--e-primary);
  }

  .e-nav-group > ul {
    padding-inline-start: var(--e-pad-control-sm);
  }

  .e-nav-label {
    flex: 1;
    min-width: 0;
  }

  .e-nav--horizontal {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--e-gap-snug) var(--e-gap-loose);
  }

  /* The separator sits inside the next item's li, so the list has no gap of its own: the margins on the separator space both sides equally. */
  .e-nav--horizontal ul {
    display: flex;
    flex-wrap: wrap;
  }

  .e-nav--horizontal li {
    display: flex;
    align-items: center;
  }

  .e-nav--horizontal li + li::before {
    content: "";
    width: var(--e-stroke-hair);
    height: var(--e-icon-size-lg);
    margin-inline: var(--e-gap-snug);
    background: var(--e-border);
  }

  .e-nav--horizontal .e-nav-heading {
    margin: 0;
    padding-inline: 0;
  }

  /* Short rows: no rule between them, a small gap instead, and a long label wraps inside its row. A touch screen keeps the full tap target. */
  .e-nav--sm {
    --_row-h: 2rem;
  }

  .e-nav--sm:not(.e-nav--horizontal) ul {
    gap: var(--e-gap-tight);
  }

  .e-nav--sm:not(.e-nav--horizontal) li + li::before {
    content: none;
  }

  .e-nav--sm .e-nav-item {
    height: auto;
    min-height: var(--_row-h);
    padding-block: var(--e-gap-tight);
    line-height: var(--e-leading-snug);
  }

  @media (pointer: coarse) {
    .e-nav--sm {
      --_row-h: var(--e-tap);
    }
  }

  @media (forced-colors: active) {
    .e-nav-item[aria-current="page"] {
      border-color: Highlight;
    }
  }
}
</style>
