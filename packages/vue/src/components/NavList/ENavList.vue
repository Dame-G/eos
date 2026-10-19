<script setup lang="ts">
import { computed, type Component } from "vue";
import EIcon from "../Icon/EIcon.vue";
import type { IconProp } from "../../icons/types.js";
import { useMessages } from "../../config.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

export interface NavItem {
  /** The words for this destination. */
  label: string;
  /** Where it goes. */
  href?: string;
  /** A router location, passed to `linkComponent` as `to` (for `RouterLink`). */
  to?: unknown;
  /** An icon before the label. */
  icon?: IconProp;
  /** A count of things waiting on the person (bills to pay, forms to sign). */
  count?: number;
  /** The page the person is on. */
  current?: boolean;
}

export interface NavSection {
  /** A small heading over the section. Leave it out for a section that needs none. */
  label?: string;
  /** The destinations of the section, in order. */
  items: NavItem[];
}

const props = withDefaults(
  defineProps<{
    /** The destinations, in order. */
    items?: NavItem[];
    /** Destinations in labelled groups, instead of `items`. Give a heading only when there is more than one section. */
    sections?: NavSection[];
    /** Shorter rows and smaller words, for a long list such as the pages of a documentation site. */
    dense?: boolean;
    /** `vertical` stacks the links, for a sidebar or a menu. `horizontal` lays them in a row, for a header: muted words, a bar under each, a heavier bar under the current page. */
    orientation?: "vertical" | "horizontal";
    /** The landmark's name, so a page with two navigations tells them apart. Defaults to "Main". */
    label?: string;
    /** What renders each link: `"a"` by default, or `RouterLink` (or any component that takes `href` or `to` and a default slot). */
    linkComponent?: string | Component;
  }>(),
  { orientation: "vertical", linkComponent: "a" },
);

const t = useMessages();
const uid = useUid();
const groups = computed<NavSection[]>(() => props.sections ?? [{ items: props.items ?? [] }]);

const linkAttrs = (item: NavItem) => ({
  ...(item.to !== undefined ? { to: item.to } : { href: item.href ?? "#" }),
  ...(item.current && { "aria-current": "page" }),
});
</script>

<template>
  <nav
    class="e-nav"
    :class="[dense && 'e-nav--dense', orientation === 'horizontal' && 'e-nav--horizontal']"
    :aria-label="label || t('mainNav')"
  >
    <template v-for="(group, g) in groups" :key="g">
      <p v-if="group.label" :id="`${uid}-${g}`" class="e-nav-heading">{{ group.label }}</p>
      <ul :aria-labelledby="group.label ? `${uid}-${g}` : undefined">
        <li v-for="(item, i) in group.items" :key="i">
          <component :is="linkComponent" class="e-nav-item" v-bind="linkAttrs(item)">
            <EIcon v-if="item.icon" :name="item.icon" />
            <span class="e-nav-label">{{ item.label }}</span>
            <span v-if="item.count != null" class="e-nav-count">{{ item.count }}</span>
          </component>
        </li>
      </ul>
    </template>
  </nav>
</template>

<style>
@layer e.page {
  .e-nav ul {
    display: grid;
    gap: 2px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .e-nav-heading {
    margin: var(--e-space-6) 0 var(--e-space-2);
    padding-inline: var(--e-space-3);
    font: 600 var(--e-text-xs) / 1.2 var(--e-font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--e-ink);
  }

  .e-nav > :first-child {
    margin-top: 0;
  }

  .e-nav-item {
    display: flex;
    align-items: center;
    gap: var(--e-space-3);
    height: var(--e-control-height);
    padding: 0 var(--e-space-3);
    border-radius: var(--e-radius-md);
    color: var(--e-ink);
    font: 400 var(--e-text-md) / 1 var(--e-font-sans);
    text-decoration: none;
    transition: background-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-nav-item:hover {
    background: var(--e-surface-tint);
  }

  .e-nav-item:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-focus-gap);
  }

  .e-nav:not(.e-nav--dense, .e-nav--horizontal) .e-nav-item {
    box-sizing: border-box;
    border: var(--e-stroke-edge) solid transparent;
  }

  .e-nav-item[aria-current="page"] {
    background: color-mix(in srgb, var(--e-surface-tint), var(--e-ink) 3%);
    font-weight: 600;
  }

  .e-nav:not(.e-nav--dense, .e-nav--horizontal) .e-nav-item[aria-current="page"] {
    border-color: var(--e-border-strong);
    border-top-width: calc(var(--e-stroke-edge) + var(--e-depth));
  }

  .e-nav-label {
    flex: 1;
    min-width: 0;
  }

  .e-nav--dense .e-nav-item {
    position: relative;
    height: 2.25rem;
    gap: var(--e-space-2);
    border-radius: 0;
    box-shadow: inset 2px 0 0 transparent;
    color: var(--e-muted);
    font-size: var(--e-text-sm);
  }

  .e-nav--dense .e-nav-item::after {
    content: "";
    position: absolute;
    inset-block: -4px;
    inset-inline: 0;
  }

  .e-nav--dense .e-nav-item:hover {
    background: transparent;
    box-shadow: inset 2px 0 0 var(--e-border-strong);
    color: var(--e-ink);
  }

  .e-nav--dense .e-nav-item[aria-current="page"] {
    background: var(--e-surface-tint);
    box-shadow: inset 3px 0 0 var(--e-primary);
    color: var(--e-primary);
    font-weight: 600;
  }

  .e-nav--dense .e-nav-heading {
    margin-top: var(--e-space-4);
    padding-top: var(--e-space-4);
    border-top: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-nav--dense > .e-nav-heading:first-child {
    padding-top: 0;
    border-top: 0;
  }

  .e-nav--horizontal {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--e-space-2) var(--e-space-4);
  }

  .e-nav--horizontal ul {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e-space-2);
  }

  .e-nav--horizontal .e-nav-heading {
    margin: 0;
    padding-inline: 0;
  }

  .e-nav--horizontal .e-nav-item {
    height: 2.5rem;
    border-radius: 0;
    background: transparent;
    box-shadow: inset 0 -2px 0 transparent;
    color: var(--e-muted);
    font-size: var(--e-text-sm);
  }

  .e-nav--horizontal .e-nav-item:hover {
    background: transparent;
    box-shadow: inset 0 -2px 0 var(--e-border-strong);
    color: var(--e-ink);
  }

  .e-nav--horizontal .e-nav-item[aria-current="page"] {
    background: var(--e-surface-tint);
    box-shadow: inset 0 -3px 0 var(--e-primary);
    color: var(--e-primary);
    font-weight: 600;
  }

  .e-nav--horizontal.e-nav--dense .e-nav-item {
    height: 2.25rem;
  }

  .e-nav-count {
    min-width: 22px;
    padding: 0 6px;
    border-radius: var(--e-radius-pill);
    background: var(--e-surface);
    box-shadow: inset 0 0 0 1px var(--e-border-strong);
    font: 600 var(--e-text-xs) / 20px var(--e-font-mono);
    text-align: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .e-nav-item {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .e-nav--horizontal .e-nav-item[aria-current="page"] {
      border-block-end: 3px solid Highlight;
    }
  }
}
</style>
