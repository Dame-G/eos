<script setup lang="ts">
import { computed, type Component } from "vue";
import EIcon from "../Icon/EIcon.vue";
import LinkNav, { type LinkItem, type LinkSection } from "./LinkNav.vue";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";

export interface NavItem extends LinkItem {
  /** An icon before the label. */
  icon?: IconProp;
  /** A count of things waiting on the person (bills to pay, forms to sign). */
  count?: number;
}

export type NavSection = LinkSection<NavItem>;

const props = withDefaults(
  defineProps<{
    /** The destinations, in order: `{ label, href?, to?, icon?, count?, current? }`. With no `href` or `to` a link goes to `#`. Set `current` yourself. */
    items?: NavItem[];
    /** Destinations in labelled groups, instead of `items`: `{ label?, items }`. Give a label only when there is more than one section. */
    sections?: NavSection[];
    /** `vertical` stacks the links, for a sidebar or a menu. `horizontal` lays them in a row, for a header, with a hairline between each. Items look the same as in the vertical list: a tint on hover, and a primary outline with a heavier bottom edge on the current page. */
    orientation?: "vertical" | "horizontal";
    /** The landmark's name; give each navigation on a page its own. @default "Main" */
    label?: string;
    /** What renders each link: `"a"` by default, or `RouterLink` (or any component that takes `href` or `to` and a default slot). Give items `to`; it receives `to` or `href`, the class `e-nav-item` and `aria-current`. */
    linkComponent?: string | Component;
  }>(),
  { orientation: "vertical", linkComponent: "a" },
);

const groups = computed<NavSection[]>(() => props.sections ?? [{ items: props.items ?? [] }]);
</script>

<template>
  <LinkNav
    class="e-nav"
    :class="orientation === 'horizontal' && 'e-nav--horizontal'"
    :groups="groups"
    :label="label"
    :link-component="linkComponent"
    item-class="e-nav-item"
    heading-class="e-nav-heading"
  >
    <template #item="{ item }">
      <EIcon v-if="item.icon" :name="item.icon" />
      <span class="e-nav-label">{{ item.label }}</span>
      <span v-if="item.count != null" class="e-nav-count">{{ item.count }}</span>
    </template>
  </LinkNav>
</template>

<style>
@layer e.page {
  .e-nav ul {
    display: grid;
    gap: calc(var(--e-space-1) / 2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .e-nav:not(.e-nav--horizontal) ul {
    gap: 0;
  }

  .e-nav:not(.e-nav--horizontal) li + li::before {
    content: "";
    display: block;
    height: var(--e-stroke-hair);
    margin-block: var(--e-space-2);
    background: color-mix(in srgb, var(--e-border) 60%, transparent);
  }

  .e-nav-item {
    display: flex;
    align-items: center;
    gap: var(--e-space-3);
    height: var(--e-control-height);
    box-sizing: border-box;
    padding: 0 calc(var(--e-space-3) - var(--e-stroke-edge));

    --e-lift: 0px;

    /* The current page is outlined with a border and its fill stops inside it, so the corner carries the edge colour alone; the other items have no edge and fill to the box. */
    border: var(--e-stroke-edge) solid transparent;
    border-bottom-width: calc(var(--e-stroke-edge) + var(--e-lift));
    border-radius: var(--e-radius-md);
    color: var(--e-ink);
    font: 400 var(--e-text-md) / 1 var(--e-font-sans);
    text-decoration: none;
    transition:
      background-color var(--e-duration-tap) var(--e-easing-out),
      border-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-nav-item:hover {
    background-color: var(--e-surface-hover);
  }

  .e-nav-item:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-focus-gap);
  }

  .e-nav-item[aria-current="page"] {
    background-color: color-mix(in srgb, var(--e-surface-tint), var(--e-ink) 3%);
    font-weight: 600;

    --e-lift: var(--e-depth);
    --e-slab: var(--e-primary);

    border-color: var(--e-primary);
    border-bottom-color: var(--e-slab);
    background-clip: padding-box;
  }

  .e-nav-item[aria-current="page"]:hover {
    --e-slab: color-mix(in srgb, var(--e-primary), var(--e-shade-slab));
  }

  .e-nav-label {
    flex: 1;
    min-width: 0;
  }

  .e-nav--horizontal {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--e-space-2) var(--e-space-4);
  }

  /* The separator sits inside the next item's li, so the list has no gap of its own: the margins on the separator space both sides equally. */
  .e-nav--horizontal ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
  }

  .e-nav--horizontal li {
    display: flex;
    align-items: center;
  }

  .e-nav--horizontal li + li::before {
    content: "";
    width: var(--e-stroke-hair);
    height: 1.75rem;
    margin-inline: var(--e-space-2);
    background: color-mix(in srgb, var(--e-border) 60%, transparent);
  }

  .e-nav--horizontal .e-nav-heading {
    margin: 0;
    padding-inline: 0;
  }

  .e-nav-count {
    min-width: var(--e-space-6);
    padding: 0 var(--e-space-2);
    border-radius: var(--e-radius-pill);
    background: color-mix(in srgb, var(--e-primary) 12%, var(--e-surface));
    box-shadow: inset 0 0 0 var(--e-stroke-hair) var(--e-primary);
    font: 600 var(--e-text-xs) / calc(5 / 3) var(--e-font-mono);
    text-align: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .e-nav-item {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .e-nav-item[aria-current="page"] {
      border-color: Highlight;
    }
  }
}
</style>
