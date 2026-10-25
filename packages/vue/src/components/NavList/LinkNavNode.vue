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

/** A key from the destination and the words, so reordering or inserting an item does not reuse another's element. */
export const keyOf = (item: LinkItem, i: number) =>
  `${typeof item.to === "string" ? item.to : (item.href ?? "")}|${item.label}|${i}`;
</script>

<script setup lang="ts">
import { computed, ref, watch, type Component } from "vue";
import { useDetails } from "../../composables/useDetails.js";
import { hasLinkTarget, linkTarget } from "../../composables/useLink.js";
import "../../styles/base.css";
import "../../styles/details.css";

const props = defineProps<{
  item: LinkItem;
  linkComponent: string | Component;
  itemClass: string;
  isCurrent: (item: LinkItem) => boolean;
}>();

defineSlots<{
  item(props: { item: LinkItem }): unknown;
}>();

const isGroup = computed(() => !!props.item.children?.length);
const holdsCurrent = (item: LinkItem): boolean => props.isCurrent(item) || !!item.children?.some(holdsCurrent);
const open = ref<boolean | undefined>(props.item.open ?? holdsCurrent(props.item));
// A group opens by itself when the current page moves into it, and is never closed on the person.
watch(
  () => holdsCurrent(props.item),
  (inside) => inside && (open.value = true),
);
const { details, summary } = useDetails(open, { disabled: () => props.item.disabled });

const attrs = computed(() => {
  const item = props.item;
  if (item.disabled) return { role: "link", "aria-disabled": "true" };
  return {
    ...linkTarget(item, props.linkComponent),
    ...(props.isCurrent(item) && { "aria-current": "page" }),
  };
});
</script>

<template>
  <details v-if="isGroup" class="e-nav-group" v-bind="details">
    <summary v-bind="summary" :class="[itemClass, 'e-nav-summary']" :data-current="holdsCurrent(item) || undefined">
      <slot name="item" :item="item" />
    </summary>
    <ul>
      <li v-for="(child, i) in item.children" :key="keyOf(child, i)">
        <LinkNavNode :item="child" :link-component="linkComponent" :item-class="itemClass" :is-current="isCurrent">
          <template #item="slot"><slot name="item" v-bind="slot" /></template>
        </LinkNavNode>
      </li>
    </ul>
  </details>
  <component
    :is="item.disabled ? 'a' : hasLinkTarget(item) ? linkComponent : 'span'"
    v-else
    :class="itemClass"
    v-bind="attrs"
  >
    <slot name="item" :item="item" />
  </component>
</template>
