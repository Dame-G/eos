<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, type Component } from "vue";
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

const props = withDefaults(
  defineProps<{
    /** The path as `{ label, href?, to? }`, top level first. The last item is the current page and is not a link. */
    items: BreadcrumbItem[];
    /** What renders each link: `"a"`, `RouterLink`, or any component that takes `href` or `to` and a default slot. With `RouterLink`, give items a `to`. Items can mix `href` and `to`, and the component receives only the attributes the item has. */
    linkComponent?: string | Component;
    /** Names the navigation. Give each breadcrumb on a page its own name. @default "Breadcrumb" */
    label?: string;
    /** Shortens a long path: only the first level and the last `maxItems - 1` stay, with a "…" button between them that shows the whole path. Needs 2 or more. */
    maxItems?: number;
  }>(),
  { linkComponent: "a" },
);

const t = useMessages();

const root = useTemplateRef<HTMLElement>("root");
const expanded = ref(false);
/** The level that takes focus after the path opens out, so keyboard focus does not fall to the page when the button goes. */
const focusAt = ref<number | null>(null);

const hidden = computed(() => {
  const max = props.maxItems;
  if (expanded.value || !max || max < 2 || props.items.length <= max) return null;
  return { from: 1, to: props.items.length - max };
});
const entries = computed(() =>
  props.items.flatMap((item, i) => {
    if (!hidden.value || i < hidden.value.from || i > hidden.value.to) return [{ item, i, more: false }];
    return i === hidden.value.from ? [{ item, i, more: true }] : [];
  }),
);

async function expand() {
  const first = hidden.value!.from;
  focusAt.value = first;
  expanded.value = true;
  await nextTick();
  root.value?.querySelector<HTMLElement>(`[data-crumb="${first}"]`)?.focus();
  focusAt.value = null;
}

const linkAttrs = (item: BreadcrumbItem) => ({
  ...(item.href !== undefined && { href: item.href }),
  ...(item.to !== undefined && { to: item.to }),
});
</script>

<template>
  <nav ref="root" class="e-crumbs" :aria-label="label || t('breadcrumb')">
    <ol>
      <template v-for="{ item, i, more } in entries" :key="i">
        <li v-if="more">
          <button type="button" class="e-crumb e-crumb-more" :aria-label="t('showFullPath')" @click="expand">
            <span aria-hidden="true">&hellip;</span>
          </button>
          <EIcon name="chevron-right" size="sm" />
        </li>
        <li v-else>
          <span
            v-if="i === items.length - 1"
            class="e-crumb-current"
            aria-current="page"
            :data-crumb="i"
            :tabindex="focusAt === i ? -1 : undefined"
            >{{ item.label }}</span
          >
          <component
            :is="linkComponent"
            v-else-if="item.href !== undefined || item.to !== undefined"
            class="e-crumb"
            :data-crumb="i"
            v-bind="linkAttrs(item)"
          >
            {{ item.label }}
          </component>
          <span v-else class="e-crumb-current" :data-crumb="i" :tabindex="focusAt === i ? -1 : undefined">{{
            item.label
          }}</span>
          <EIcon v-if="i < items.length - 1" name="chevron-right" size="sm" />
        </li>
      </template>
    </ol>
  </nav>
</template>

<style>
@layer e.page {
  .e-crumbs ol {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--e-gap-tight) var(--e-gap-snug);
    margin: 0;
    padding: 0;
    list-style: none;
    font: var(--e-weight-regular) var(--e-text-sm) / calc(10 / 7) var(--e-font-sans);
  }

  .e-crumbs li {
    display: inline-flex;
    align-items: center;
    gap: var(--e-gap-snug);
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
    border-radius: var(--e-radius-sm);
    transition: var(--e-transition-state);
  }

  /* The "…" that stands for the levels left out is a button that looks like a link. */
  .e-crumb-more {
    padding: 0 var(--e-gap-tight);
    border: 0;
    background: transparent;
    font: inherit;
    text-decoration: none;
    cursor: pointer;
  }

  .e-crumb::after {
    content: "";
    position: absolute;
    inset: calc((var(--e-tap) - var(--e-icon-size)) / -2) calc(-1 * var(--e-gap-tight));
  }

  .e-crumb:hover {
    color: var(--e-ink);
    text-decoration-color: var(--e-ink);
    background-color: var(--e-wash-hover);
  }

  .e-crumb:active {
    background-color: var(--e-wash-press);
  }

  .e-crumb:focus-visible,
  .e-crumb-current:focus-visible {
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
