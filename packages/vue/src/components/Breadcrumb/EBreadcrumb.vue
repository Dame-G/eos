<script setup lang="ts">
import type { Component } from "vue";
import EIcon from "../Icon/EIcon.vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

export interface BreadcrumbItem {
  /** The words for this level. */
  label: string;
  /** Where it goes. Omit it on the last item, which is the current page. */
  href?: string;
  /** A router location, passed to `linkComponent` as `to` (for `RouterLink`). */
  to?: unknown;
}

withDefaults(
  defineProps<{
    /** The path, top level first. The last item is the current page and is not a link. */
    items: BreadcrumbItem[];
    /** What renders each link: `"a"` by default, or `RouterLink` (or any component that takes `href` or `to` and a default slot). */
    linkComponent?: string | Component;
  }>(),
  { linkComponent: "a" },
);

const t = useMessages();

// Only attributes that have a value: an undefined `href` would override the one a router link computes.
const linkAttrs = (item: BreadcrumbItem) => ({
  ...(item.href !== undefined && { href: item.href }),
  ...(item.to !== undefined && { to: item.to }),
});
</script>

<template>
  <nav class="e-crumbs" :aria-label="t('breadcrumb')">
    <ol>
      <li v-for="(item, i) in items" :key="i">
        <span v-if="i === items.length - 1" class="e-crumb-current" aria-current="page">{{ item.label }}</span>
        <component
          :is="linkComponent"
          v-else-if="item.href !== undefined || item.to !== undefined"
          class="e-crumb"
          v-bind="linkAttrs(item)"
        >
          {{ item.label }}
        </component>
        <span v-else class="e-crumb-current">{{ item.label }}</span>
        <EIcon v-if="i < items.length - 1" name="chevron-right" small />
      </li>
    </ol>
  </nav>
</template>

<style>
@layer e.page {
  .e-crumbs ol {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--e-space-1) var(--e-space-2);
    margin: 0;
    padding: 0;
    list-style: none;
    font: 400 var(--e-text-sm) / 20px var(--e-font-sans);
  }

  .e-crumbs li {
    display: inline-flex;
    align-items: center;
    gap: var(--e-space-2);
    color: var(--e-muted);
  }

  .e-crumb,
  .e-crumb-current {
    display: inline-flex;
    align-items: center;
    min-height: var(--e-control-height);
  }

  .e-crumb {
    color: var(--e-primary);
    text-decoration: underline;
    text-decoration-color: var(--e-primary);
    text-underline-offset: 3px;
  }

  .e-crumb:hover {
    color: var(--e-ink);
    text-decoration-color: var(--e-ink);
  }

  .e-crumb:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-focus-gap);
    border-radius: var(--e-radius-sm);
  }

  .e-crumb-current {
    color: var(--e-ink);
    font-weight: 500;
  }
}
</style>
