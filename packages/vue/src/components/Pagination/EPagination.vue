<script setup lang="ts">
import { computed, watch } from "vue";
import EButton from "../Button/EButton.vue";
import { useMessages } from "../../config.js";
import { useAnnouncer } from "../../composables/useAnnouncer.js";
import "../../styles/base.css";

const props = defineProps<{
  /** How many pages there are. With 0 there is nothing to page and both steps dim. */
  pageCount: number;
  /** Makes each page, Previous and Next a link to this address, for pages the server renders. The current page still updates `v-model`. */
  href?: (page: number) => string;
  /** Names the navigation. Give each pager on a page its own name. @default "Pagination" */
  label?: string;
}>();

/** The current page, from 1. A value outside 1 to `pageCount` is moved to the nearest page. */
const page = defineModel<number>({ default: 1 });

const t = useMessages();
const { announce } = useAnnouncer();

const count = computed(() => Math.max(0, Math.floor(props.pageCount) || 0));
const current = computed(() => Math.min(Math.max(1, Math.floor(page.value) || 1), Math.max(count.value, 1)));

watch(
  [current, page],
  () => {
    if (page.value !== current.value) page.value = current.value;
  },
  { immediate: true },
);

watch(current, (n) => {
  if (count.value) announce(t("pageOf", { n, total: count.value }));
});

const atStart = computed(() => current.value <= 1);
const atEnd = computed(() => current.value >= count.value);

/** A dimmed step stays focusable (`aria-disabled`), so pressing it on the last page does not drop focus to the page. */
function go(n: number) {
  if (n < 1 || n > count.value) return;
  page.value = n;
}

const items = computed<(number | "gap")[]>(() => {
  const list: (number | "gap")[] = [];
  for (let i = 1; i <= count.value; i++) {
    if (i === 1 || i === count.value || Math.abs(i - current.value) <= 1) list.push(i);
    else if (list[list.length - 1] !== "gap") list.push("gap");
  }
  return list.map((n, k) => {
    const before = list[k - 1];
    const after = list[k + 1];
    return n === "gap" && typeof before === "number" && typeof after === "number" && after - before === 2
      ? before + 1
      : n;
  });
});
</script>

<template>
  <nav class="e-pager" :aria-label="label || t('pagination')">
    <EButton
      variant="outline"
      icon="chevron-left"
      :href="href && !atStart ? href(current - 1) : undefined"
      :aria-disabled="atStart ? 'true' : undefined"
      @click="go(current - 1)"
    >
      {{ t("previous") }}
    </EButton>
    <ul class="e-pages">
      <li v-for="(n, i) in items" :key="i">
        <span v-if="n === 'gap'" class="e-page-gap" aria-hidden="true">&hellip;</span>
        <component
          :is="href ? 'a' : 'button'"
          v-else
          :type="href ? undefined : 'button'"
          :href="href ? href(n) : undefined"
          class="e-page"
          :aria-current="n === current ? 'page' : undefined"
          :aria-label="t('pageN', { n })"
          @click="go(n)"
        >
          {{ n }}
        </component>
      </li>
    </ul>
    <!-- Shown in place of the page list when the pager is narrow. -->
    <p v-if="count" class="e-pager-status">{{ t("pageOf", { n: current, total: count }) }}</p>
    <EButton
      variant="outline"
      icon-end="chevron-right"
      :href="href && !atEnd ? href(current + 1) : undefined"
      :aria-disabled="atEnd ? 'true' : undefined"
      @click="go(current + 1)"
    >
      {{ t("next") }}
    </EButton>
  </nav>
</template>

<style>
@layer e.composites {
  .e-pager {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: var(--e-gap-base);
    container-type: inline-size;
  }

  .e-pages {
    display: flex;
    align-items: flex-start;
    gap: var(--e-gap-tight);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .e-pager-status {
    display: none;
    margin: 0;
    font: var(--e-weight-medium) var(--e-text-sm) / 1.2 var(--e-font-mono);
    font-variant-numeric: tabular-nums;
    color: var(--e-muted);
  }

  .e-page {
    --_slab: transparent;
    --_ring: var(--_slab);
    --_lift: 0px;

    display: inline-grid;
    place-items: center;
    box-sizing: border-box;
    min-width: var(--e-control-height);
    height: var(--e-control-height);
    padding-block: 0;
    padding-inline: calc(var(--e-gap-snug) - var(--e-stroke-edge));
    border: var(--e-stroke-edge) solid var(--_ring);
    border-bottom-width: calc(var(--e-stroke-edge) + var(--_lift));
    border-radius: var(--e-radius-md);
    background: transparent;
    color: var(--e-ink);
    font: var(--e-weight-medium) var(--e-text-sm) / var(--e-leading-none) var(--e-font-mono);
    font-variant-numeric: tabular-nums;
    text-decoration: none;
    cursor: pointer;
    transition: var(--e-transition-state);
  }

  .e-page:not([aria-current="page"]):hover {
    background: var(--e-wash-hover);
    box-shadow: var(--e-ring-hover);
  }

  .e-page:not([aria-current="page"]):active {
    background: var(--e-wash-press);
    box-shadow: var(--e-ring-press);
  }

  .e-page:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-stroke-focus);
  }

  /* The current page is a value: filled primary on its slab. */
  .e-page[aria-current="page"] {
    --_slab: var(--e-primary-slab);
    --_lift: var(--e-slab);

    background: var(--e-primary);
    color: var(--e-on-primary);
    font-weight: var(--e-weight-strong);
    cursor: default;
  }

  .e-page-gap {
    display: inline-grid;
    place-items: center;
    min-width: calc(var(--e-gap-section) + var(--e-gap-tight));
    height: var(--e-control-height);
    color: var(--e-muted);
  }

  @container (max-width: 26rem) {
    .e-pages {
      display: none;
    }

    .e-pager-status {
      display: block;
    }
  }

  @media (forced-colors: active) {
    .e-page[aria-current="page"] {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }

  @media print {
    .e-pager {
      display: none;
    }
  }
}
</style>
