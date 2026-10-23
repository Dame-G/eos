<script lang="ts">
export interface LinkItem {
  /** The words for this destination. */
  label: string;
  /** Where it goes. Without `href` or `to` the item is plain text, not a link. */
  href?: string;
  /** A router location, passed to `linkComponent` as `to` (for `RouterLink`). */
  to?: unknown;
  /** The page the person is on. Left out, `isCurrent` decides. */
  current?: boolean;
  /** Shown but not choosable: dimmed, not a link, and skipped by Tab. */
  disabled?: boolean;
  /** More items under this one. The item becomes a group that opens and closes and is not itself a link. */
  children?: LinkItem[];
  /** Whether a group starts open. A group that holds the current page starts open anyway. */
  open?: boolean;
}

export interface LinkSection<T extends LinkItem = LinkItem> {
  /** A small heading over the section. Leave it out for a section that needs none. */
  label?: string;
  /** The destinations of the section, in order. */
  items: T[];
}
</script>

<script setup lang="ts" generic="T extends LinkItem">
import type { Component } from "vue";
import LinkNavNode, { keyOf } from "./LinkNavNode.vue";
import { useMessages } from "../../config.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

const props = defineProps<{
  groups: LinkSection<T>[];
  label?: string;
  linkComponent: string | Component;
  itemClass: string;
  headingClass: string;
  isCurrent?: (item: T) => boolean;
}>();

defineSlots<{
  item(props: { item: T }): unknown;
}>();

const t = useMessages();
const uid = useUid();
const current = (item: LinkItem) => item.current ?? props.isCurrent?.(item as T) ?? false;
</script>

<template>
  <nav :aria-label="label || t('mainNav')">
    <template v-for="(group, g) in groups" :key="group.label ?? g">
      <p v-if="group.label" :id="`${uid}-${g}`" :class="headingClass">{{ group.label }}</p>
      <ul :aria-labelledby="group.label ? `${uid}-${g}` : undefined">
        <li v-for="(item, i) in group.items" :key="keyOf(item, i)">
          <LinkNavNode :item="item" :link-component="linkComponent" :item-class="itemClass" :is-current="current">
            <template #item="slot"><slot name="item" :item="slot.item as T" /></template>
          </LinkNavNode>
        </li>
      </ul>
    </template>
  </nav>
</template>

<style>
@layer e.containers {
  .e-nav-heading {
    margin-block: var(--e-gap-section) var(--e-gap-snug);
    margin-inline: 0;
    padding-inline: var(--e-pad-control-sm);
    font: var(--e-type-kicker);
    letter-spacing: var(--e-tracking-label);
    text-transform: uppercase;
    color: var(--e-ink);
  }

  .e-nav > :first-child {
    margin-block-start: 0;
  }
}
</style>
