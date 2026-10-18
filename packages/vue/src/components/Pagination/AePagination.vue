<script setup lang="ts">
import { computed } from "vue";
import AeButton from "../Button/AeButton.vue";
import AeIcon from "../Icon/AeIcon.vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

const props = defineProps<{
  /** How many pages there are. */
  pageCount: number;
}>();

/** The current page, from 1. */
const page = defineModel<number>({ default: 1 });

const t = useMessages();

/** The first, last and neighbouring pages; a gap stands for the pages left out (a single hidden page is shown instead). */
const items = computed<(number | "gap")[]>(() => {
  const list: (number | "gap")[] = [];
  for (let i = 1; i <= props.pageCount; i++) {
    if (i === 1 || i === props.pageCount || Math.abs(i - page.value) <= 1) list.push(i);
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
  <nav class="ae-pager" :aria-label="t('pagination')">
    <AeButton variant="outline" icon="chevron-left" :disabled="page <= 1" @click="page = page - 1">
      {{ t("previous") }}
    </AeButton>
    <ul class="ae-pages">
      <li v-for="(n, i) in items" :key="i">
        <span v-if="n === 'gap'" class="ae-page-gap" aria-hidden="true">&hellip;</span>
        <button
          v-else
          type="button"
          class="ae-page"
          :aria-current="n === page ? 'page' : undefined"
          :aria-label="t('pageN', { n })"
          @click="page = n"
        >
          {{ n }}
        </button>
      </li>
    </ul>
    <AeButton variant="outline" :disabled="page >= pageCount" @click="page = page + 1">
      {{ t("next") }}
      <AeIcon name="chevron-right" />
    </AeButton>
  </nav>
</template>

<style>
@layer ae.composites {
  .ae-pager {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: var(--ae-space-3);
  }

  .ae-pages {
    display: flex;
    align-items: center;
    gap: var(--ae-space-1);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .ae-page {
    display: inline-grid;
    place-items: center;
    min-width: var(--ae-control-height);
    height: var(--ae-control-height);
    padding: 0 var(--ae-space-2);
    border: var(--ae-stroke-edge) solid transparent;
    border-radius: var(--ae-radius-md);
    background: transparent;
    color: var(--ae-ink);
    font: 500 var(--ae-text-sm)/1 var(--ae-font-mono);
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    transition:
      background-color var(--ae-duration-tap) var(--ae-easing-out),
      border-color var(--ae-duration-tap) var(--ae-easing-out);
  }

  .ae-page:hover {
    background: var(--ae-surface-tint);
    border-color: var(--ae-border-strong);
  }

  .ae-page:focus-visible {
    outline: var(--ae-stroke-focus) solid var(--ae-focus-ring);
    outline-offset: var(--ae-focus-gap);
  }

  .ae-page[aria-current="page"] {
    background: var(--ae-primary);
    border-color: var(--ae-primary);
    color: var(--ae-on-primary);
    font-weight: 600;
    cursor: default;
  }

  .ae-page-gap {
    display: inline-grid;
    place-items: center;
    min-width: 28px;
    color: var(--ae-muted);
  }

  @media (max-width: 32rem) {
    .ae-pages {
      display: none;
    }

    .ae-pager {
      justify-content: space-between;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-page {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .ae-page[aria-current="page"] {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }

  @media print {
    .ae-pager {
      display: none;
    }
  }
}
</style>
