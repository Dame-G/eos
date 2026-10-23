<script lang="ts">
export interface LinkItem {
  /** The words for this destination. */
  label: string;
  /** Where it goes. Without `href` or `to` the item is plain text, not a link. */
  href?: string;
  /** A router location, passed to `linkComponent` as `to` (for `RouterLink`). */
  to?: unknown;
  /** The page the person is on. */
  current?: boolean;
}

export interface LinkSection<T extends LinkItem = LinkItem> {
  /** A small heading over the section. Leave it out for a section that needs none. */
  label?: string;
  /** The destinations of the section, in order. */
  items: T[];
}

const hasTarget = (item: LinkItem) => item.to !== undefined || item.href !== undefined;
const linkAttrs = (item: LinkItem) => ({
  ...(item.to !== undefined ? { to: item.to } : item.href !== undefined ? { href: item.href } : {}),
  ...(item.current && { "aria-current": "page" }),
});
/** A key from the destination and the words, so reordering or inserting an item does not reuse another's element. */
const keyOf = (item: LinkItem, i: number) =>
  `${typeof item.to === "string" ? item.to : (item.href ?? "")}|${item.label}|${i}`;
</script>

<script setup lang="ts" generic="T extends LinkItem">
import type { Component } from "vue";
import { useMessages } from "../../config.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

defineProps<{
  groups: LinkSection<T>[];
  label?: string;
  linkComponent: string | Component;
  itemClass: string;
  headingClass: string;
  listClass?: string;
}>();

defineSlots<{
  item(props: { item: T }): unknown;
}>();

const t = useMessages();
const uid = useUid();
</script>

<template>
  <nav :aria-label="label || t('mainNav')">
    <template v-for="(group, g) in groups" :key="group.label ?? g">
      <p v-if="group.label" :id="`${uid}-${g}`" :class="headingClass">{{ group.label }}</p>
      <ul :class="listClass" :aria-labelledby="group.label ? `${uid}-${g}` : undefined">
        <li v-for="(item, i) in group.items" :key="keyOf(item, i)">
          <component :is="hasTarget(item) ? linkComponent : 'span'" :class="itemClass" v-bind="linkAttrs(item)">
            <slot name="item" :item="item" />
          </component>
        </li>
      </ul>
    </template>
  </nav>
</template>

<style>
@layer e.containers {
  .e-nav-heading {
    margin-block: var(--e-space-6) var(--e-space-2);
    margin-inline: 0;
    padding-inline: var(--e-space-3);
    font: var(--e-weight-strong) var(--e-text-sm) / 1.2 var(--e-font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--e-ink);
  }

  .e-nav > :first-child {
    margin-block-start: 0;
  }
}
</style>
