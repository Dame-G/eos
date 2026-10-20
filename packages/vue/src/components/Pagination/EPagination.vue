<script setup lang="ts">
import { computed } from "vue";
import EButton from "../Button/EButton.vue";
import EIcon from "../Icon/EIcon.vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

const props = defineProps<{
  /** How many pages there are. */
  pageCount: number;
}>();

/** The current page, from 1. */
const page = defineModel<number>({ default: 1 });

const t = useMessages();

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
  <nav class="e-pager" :aria-label="t('pagination')">
    <EButton variant="outline" icon="chevron-left" :disabled="page <= 1" @click="page = page - 1">
      {{ t("previous") }}
    </EButton>
    <ul class="e-pages">
      <li v-for="(n, i) in items" :key="i">
        <span v-if="n === 'gap'" class="e-page-gap" aria-hidden="true">&hellip;</span>
        <button
          v-else
          type="button"
          class="e-page"
          :aria-current="n === page ? 'page' : undefined"
          :aria-label="t('pageN', { n })"
          @click="page = n"
        >
          {{ n }}
        </button>
      </li>
    </ul>
    <EButton variant="outline" :disabled="page >= pageCount" @click="page = page + 1">
      {{ t("next") }}
      <EIcon name="chevron-right" />
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
    gap: var(--e-space-3);
  }

  .e-pages {
    display: flex;
    align-items: center;
    gap: var(--e-space-1);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .e-page {
    display: inline-grid;
    place-items: center;
    min-width: var(--e-control-height);
    height: var(--e-control-height);
    padding: 0 var(--e-space-2);
    border: 0;
    border-radius: var(--e-radius-md);
    background: transparent;
    color: var(--e-ink);
    font: 500 var(--e-text-sm)/1 var(--e-font-mono);
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    transition:
      background-color var(--e-duration-tap) var(--e-easing-out),
      box-shadow var(--e-duration-tap) var(--e-easing-out);
  }

  .e-page:hover {
    background: var(--e-surface-hover);
    box-shadow: inset 0 0 0 var(--e-stroke-edge) var(--e-border-strong);
  }

  .e-page:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-focus-gap);
  }

  .e-page[aria-current="page"] {
    background: var(--e-primary);
    box-shadow: none;
    color: var(--e-on-primary);
    font-weight: 600;
    cursor: default;
  }

  .e-page-gap {
    display: inline-grid;
    place-items: center;
    min-width: calc(var(--e-space-6) + var(--e-space-1));
    color: var(--e-muted);
  }

  @media (max-width: 32rem) {
    .e-pages {
      display: none;
    }

    .e-pager {
      justify-content: space-between;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .e-page {
      transition: none;
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
