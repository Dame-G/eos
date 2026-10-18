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
    /** The landmark's name, so a page with two navigations tells them apart. Defaults to "Main". */
    label?: string;
    /** What renders each link: `"a"` by default, or `RouterLink` (or any component that takes `href` or `to` and a default slot). */
    linkComponent?: string | Component;
  }>(),
  { linkComponent: "a" },
);

const t = useMessages();
const uid = useUid();
const groups = computed<NavSection[]>(() => props.sections ?? [{ items: props.items ?? [] }]);

// Only attributes that have a value: an undefined `href` would override the one a router link computes.
const linkAttrs = (item: NavItem) => ({
  ...(item.to !== undefined ? { to: item.to } : { href: item.href ?? "#" }),
  ...(item.current && { "aria-current": "page" }),
});
</script>

<template>
  <nav class="e-nav" :class="dense && 'e-nav--dense'" :aria-label="label || t('mainNav')">
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
    color: var(--e-muted);
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

  .e-nav-item[aria-current="page"] {
    background: var(--e-surface-tint);
    box-shadow: inset 0 0 0 1.5px var(--e-border-strong);
    font-weight: 600;
  }

  .e-nav-label {
    flex: 1;
    min-width: 0;
  }

  .e-nav--dense .e-nav-item {
    height: 2.25rem;
    gap: var(--e-space-2);
    font-size: var(--e-text-sm);
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
}
</style>
