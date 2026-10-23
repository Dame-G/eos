<script setup lang="ts">
import { computed, type Component } from "vue";
import EIcon from "../Icon/EIcon.vue";
import LinkNavNode, { keyOf, type LinkItem } from "./LinkNavNode.vue";
import { useMessages } from "../../config.js";
import { useUid } from "../../composables/useUid.js";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";

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

const props = withDefaults(
  defineProps<{
    /** The destinations, in order: `{ label, href?, to?, icon?, count?, countLabel?, current?, disabled?, children? }`. With no `href` or `to` the item is plain text, not a link. `current` marks the current page and wins over `isCurrent`. */
    items?: NavItem[];
    /** Destinations in labelled groups, instead of `items`: `{ label?, items }`. A label is needed only when there is more than one section. */
    sections?: NavSection[];
    /** `vertical` stacks the links, for a sidebar or a menu. `horizontal` lays them in a row, for a header. */
    orientation?: "vertical" | "horizontal";
    /** The landmark's name. Each navigation on a page needs its own. @default "Main" */
    label?: string;
    /** What renders each link: `RouterLink` or any component that takes `href` or `to` and a default slot. It receives `to` or `href`, the class `e-nav-item` and `aria-current`. Items then use `to`. */
    linkComponent?: string | Component;
    /** Says which item is the current page, for every item whose `current` is not set: `(item) => item.href === route.path`. It runs again when what it reads changes. */
    isCurrent?: (item: NavItem) => boolean;
  }>(),
  { orientation: "vertical", linkComponent: "a" },
);

const t = useMessages();
const uid = useUid();
const groups = computed<NavSection[]>(() => props.sections ?? [{ items: props.items ?? [] }]);
/** The recursive node knows only the link fields; every item it hands back is one of ours. */
const nav = (item: LinkItem) => item as NavItem;
const current = (item: LinkItem) => item.current ?? props.isCurrent?.(nav(item)) ?? false;
</script>

<template>
  <nav class="e-nav" :class="orientation === 'horizontal' && 'e-nav--horizontal'" :aria-label="label || t('mainNav')">
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
                class="e-nav-count"
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
    font: var(--e-weight-strong) var(--e-text-sm) / 1.2 var(--e-font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--e-ink);
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

  /* A row uses the slab contract with no edge at rest, so the current page can rise without the row changing size. */
  .e-nav-item {
    --_slab: transparent;
    --_ring: var(--_slab);
    --_lift: 0px;

    display: flex;
    align-items: center;
    gap: var(--e-gap-base);
    box-sizing: border-box;
    height: var(--e-control-height);
    padding-block: 0;
    padding-inline: calc(var(--e-pad-control-sm) - var(--e-stroke-edge));
    border: var(--e-stroke-edge) solid var(--_ring);
    border-bottom-width: calc(var(--e-stroke-edge) + var(--_lift));
    border-radius: var(--e-radius-md);
    color: var(--e-ink);
    font: var(--e-weight-regular) var(--e-text-md) / var(--e-leading-none) var(--e-font-sans);
    text-decoration: none;
    transition: var(--e-transition-state);
  }

  .e-nav-item:is(a, button, summary):not([aria-current="page"], [aria-disabled="true"]):hover {
    background-color: var(--e-wash-hover);
    box-shadow: var(--e-ring-hover);
  }

  .e-nav-item:is(a, button, summary):not([aria-current="page"], [aria-disabled="true"]):active {
    background-color: var(--e-wash-press);
    box-shadow: var(--e-ring-press);
  }

  .e-nav-item:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-stroke-focus);
  }

  /* Where you are: a washed face with the primary slab, in the voice tabs use. */
  .e-nav-item[aria-current="page"] {
    --_slab: var(--e-primary);
    --_lift: var(--e-slab);

    background-color: var(--e-surface-hover);
    background-clip: padding-box;
    color: var(--e-primary);
    font-weight: var(--e-weight-strong);
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

  .e-nav-summary::after {
    content: "";
    flex: none;
    width: var(--e-gap-snug);
    height: var(--e-gap-snug);
    border-inline-end: var(--e-stroke-card) solid currentcolor;
    border-bottom: var(--e-stroke-card) solid currentcolor;
    transform: translateY(-2px) rotate(45deg);
    transition: transform var(--e-duration-tap) var(--e-easing-out);
  }

  .e-nav-group[open] > .e-nav-summary::after {
    transform: translateY(2px) rotate(-135deg);
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
    height: var(--e-icon-size-md);
    margin-inline: var(--e-gap-snug);
    background: var(--e-border);
  }

  .e-nav--horizontal .e-nav-heading {
    margin: 0;
    padding-inline: 0;
  }

  .e-nav-count {
    min-width: var(--e-gap-section);
    padding-block: 0;
    padding-inline: var(--e-gap-snug);
    border-radius: var(--e-radius-pill);
    background: var(--e-primary-soft);
    border: var(--e-stroke-edge) solid var(--e-primary);
    background-clip: padding-box;
    font: var(--e-weight-strong) var(--e-text-xs) / calc(5 / 3) var(--e-font-mono);
    text-align: center;
  }

  @media (forced-colors: active) {
    .e-nav-item[aria-current="page"] {
      border-color: Highlight;
    }
  }
}
</style>
