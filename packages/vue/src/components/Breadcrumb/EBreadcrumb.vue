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
    /** The path as `{ label, href?, to? }`, top level first. The last item is the current page and is not a link. */
    items: BreadcrumbItem[];
    /** What renders each link: `"a"`, `RouterLink`, or any component that takes `href` or `to` and a default slot. With `RouterLink`, give items a `to`. Items can mix `href` and `to`, and the component receives only the attributes the item has. */
    linkComponent?: string | Component;
  }>(),
  { linkComponent: "a" },
);

const t = useMessages();

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
    font: var(--e-weight-regular) var(--e-text-sm) / calc(10 / 7) var(--e-font-sans);
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
  }

  .e-crumb {
    position: relative;
    color: var(--e-text-link);
    text-decoration: underline;
    text-decoration-color: var(--e-text-link);
    text-underline-offset: 3px;
  }

  .e-crumb::after {
    content: "";
    position: absolute;
    inset: calc((var(--e-tap) - var(--e-icon-size)) / -2) calc(-1 * var(--e-space-1));
  }

  .e-crumb:hover {
    color: var(--e-ink);
    text-decoration-color: var(--e-ink);
  }

  .e-crumb:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-stroke-focus);
    border-radius: var(--e-radius-sm);
  }

  .e-crumb-current {
    color: var(--e-ink);
    font-weight: var(--e-weight-medium);
  }
}
</style>
