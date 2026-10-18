<script setup lang="ts">
import { computed } from "vue";
import ESurface from "../Surface/ESurface.vue";
import EStamp from "../Stamp/EStamp.vue";
import EActions from "../Actions/EActions.vue";
import EDescriptionList from "../DescriptionList/EDescriptionList.vue";
import EDisclosure from "../Disclosure/EDisclosure.vue";
import ETimeline from "../Timeline/ETimeline.vue";
import type { StatementProps } from "../StatementCard/types.js";
import { useMessages } from "../../config.js";
import { useLocale } from "../../composables/useLocale.js";
import "../../styles/base.css";

const props = defineProps<StatementProps>();

defineSlots<{
  /** Buttons for the bar at the foot of the opened row: Pay now first, then Download. */
  actions?(): unknown;
}>();

const t = useMessages();
const hasTotals = computed(() => Boolean(props.details && props.details.length));
const { formatMoney } = useLocale();
const money = (n: number) => formatMoney(n, { currency: props.currency, locale: props.locale });
</script>

<template>
  <details class="e-srow">
    <summary>
      <EStamp :status="status" :tone="tone" :label="label" small />
      <div class="e-srow-main">
        <p class="e-srow-title">{{ title }}</p>
        <p v-if="subtitle" class="e-srow-sub">{{ subtitle }}</p>
      </div>
      <span class="e-srow-amount">{{ money(amount) }}</span>
    </summary>
    <div class="e-srow-body">
      <div class="e-srow-content">
        <div v-if="reason || hasTotals" class="e-srow-lead" :class="hasTotals ? 'e-srow-lead--totals' : null">
          <p v-if="reason" class="e-stmt-reason">{{ reason }}</p>
          <ESurface v-if="hasTotals" as="dl" class="e-totals" pad="sm">
            <div v-for="d in details" :key="d.label" class="e-totals-row">
              <dt>{{ d.label }}</dt>
              <dd>{{ typeof d.value === "number" ? money(d.value) : d.value }}</dd>
            </div>
            <div class="e-totals-row e-totals-row--sum">
              <dt>{{ amountLabel || t("amount") }}</dt>
              <dd>{{ money(amount) }}</dd>
            </div>
          </ESurface>
        </div>
        <EDescriptionList v-if="parts && parts.length" :items="parts" />
        <EDisclosure
          v-if="activity && activity.length"
          :title="`${activityTitle || t('history')} (${activity.length})`"
        >
          <ETimeline :items="activity" />
        </EDisclosure>
      </div>
      <EActions v-if="$slots.actions" bar><slot name="actions" /></EActions>
    </div>
  </details>
</template>

<style>
@layer e.account {
  .e-srow {
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
    box-shadow:
      var(--e-edge),
      inset 0 -2px 0 0 var(--e-border);
    transition:
      background-color var(--e-duration-tap) var(--e-easing-out),
      box-shadow var(--e-duration-tap) var(--e-easing-out);
  }

  .e-srow:not([open]):hover {
    background: var(--e-surface-tint);
    box-shadow:
      0 0 0 1px var(--e-border-strong),
      inset 0 -2px 0 0 var(--e-border-strong);
  }

  .e-srow[open] {
    box-shadow: var(--e-edge);
  }

  .e-srow[open]:has(> summary:hover) {
    box-shadow: 0 0 0 1px var(--e-border-strong);
  }

  .e-srow[open] > summary:hover {
    background: var(--e-surface-tint);
    border-bottom-color: var(--e-border-strong);
  }

  .e-srow > summary {
    border-radius: var(--e-radius-md);
    display: grid;
    grid-template-columns: 8.75rem minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--e-space-3);
    padding: var(--e-space-3) var(--e-space-4);
    list-style: none;
    cursor: pointer;
  }

  .e-srow > summary::-webkit-details-marker {
    display: none;
  }

  .e-srow > summary:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-focus-gap);
  }

  .e-srow .e-stamp {
    /* stylelint-disable-next-line declaration-block-no-redundant-longhand-properties -- two longhands, as in the reference */
    justify-self: start;
    align-self: center;
  }

  .e-srow-main {
    min-width: 0;
  }

  .e-srow-title {
    margin: 0;
    font: 500 var(--e-text-md) / 1.3 var(--e-font-sans);
    overflow-wrap: anywhere;
    text-wrap: balance;
  }

  .e-srow-sub {
    margin: var(--e-space-1) 0 0;
    font: 400 var(--e-text-sm) / 1.4 var(--e-font-sans);
    color: var(--e-muted);
    overflow-wrap: anywhere;
  }

  .e-srow-amount {
    min-width: 5.5rem;
    font: 500 var(--e-text-md) / 1.3 var(--e-font-mono);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    text-align: end;
  }

  .e-srow[open] > summary {
    border-radius: var(--e-radius-md) var(--e-radius-md) 0 0;
    border-bottom: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-srow-body {
    container-type: inline-size;
    border-radius: 0 0 var(--e-radius-md) var(--e-radius-md);
  }

  .e-srow-content {
    display: grid;
    gap: var(--e-space-2);
    padding: var(--e-space-4);
  }

  .e-srow-body > .e-actions--bar:last-child {
    border-end-start-radius: var(--e-radius-md);
    border-end-end-radius: var(--e-radius-md);
  }

  .e-srow-body .e-stmt-reason {
    margin: 0;
  }

  .e-srow-lead {
    display: grid;
    gap: var(--e-space-4);
    align-items: start;
  }

  .e-totals {
    display: grid;
    gap: var(--e-space-1);
    margin: 0;
  }

  .e-totals-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--e-space-3);
  }

  .e-totals-row dt {
    font: 400 var(--e-text-sm) / 1.4 var(--e-font-sans);
    color: var(--e-muted);
  }

  .e-totals-row dd {
    margin: 0;
    font: 500 var(--e-text-sm) / 1.4 var(--e-font-mono);
    font-variant-numeric: tabular-nums;
  }

  .e-totals-row--sum {
    margin-top: var(--e-space-2);
    padding-top: var(--e-space-3);
    border-top: var(--e-stroke-hair) solid var(--e-border-strong);
  }

  .e-totals-row--sum dt {
    font: 500 var(--e-text-md) / 1.3 var(--e-font-sans);
    color: var(--e-ink);
  }

  .e-totals-row--sum dd {
    font-size: var(--e-text-xl);
  }

  @container (min-width: 34rem) {
    .e-srow-lead--totals {
      grid-template-columns: minmax(0, 1fr) minmax(14rem, 18rem);
    }
  }

  @media (max-width: 32rem) {
    .e-srow > summary {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
    }

    .e-srow .e-stamp {
      grid-column: 1 / -1;
      justify-self: start;
      padding-inline: var(--e-space-2);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .e-srow {
      transition: none;
    }
  }

  @media print {
    .e-srow,
    .e-totals {
      box-shadow: none;
      border: 1px solid #000;
      break-inside: avoid;
    }
  }
}
</style>
