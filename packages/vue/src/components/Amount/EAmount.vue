<script setup lang="ts">
import { useLocale } from "../../composables/useLocale.js";
import "../../styles/base.css";

export interface AmountDetail {
  /** What the line is, such as "Insurance paid". */
  label: string;
  /** A number is shown as money; text is shown as it is. */
  value: number | string;
}

defineProps<{
  /** The lead amount, as a number. */
  amount: number;
  /** What the amount is ("You owe", "Paid", "Balance"), a small uppercase label above it. */
  label?: string;
  /** ISO 4217 code for this figure. Overrides the configured currency. */
  currency?: string;
  /** BCP 47 tag for this figure. Overrides the configured locale. */
  locale?: string;
  /** Lines under the amount. Add them only when they add information. */
  details?: AmountDetail[];
}>();

const { formatMoney } = useLocale();
</script>

<template>
  <div class="e-amount">
    <span v-if="label" class="e-amount-label">{{ label }}</span>
    <span class="e-amount-main">{{ formatMoney(amount, { currency, locale }) }}</span>
    <div v-if="details && details.length" class="e-amount-meta">
      <span v-for="d in details" :key="d.label">
        {{ d.label }} {{ typeof d.value === "number" ? formatMoney(d.value, { currency, locale }) : d.value }}
      </span>
    </div>
  </div>
</template>

<style>
@layer e.account {
  .e-amount {
    display: grid;
    gap: var(--e-space-1);
    min-width: 0;
  }

  .e-amount-main {
    font: 500 var(--e-text-3xl) / 1 var(--e-font-mono);
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    color: var(--e-ink);
  }

  .e-amount-label {
    font: 600 var(--e-text-xs) / 1.2 var(--e-font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--e-muted);
  }

  .e-amount-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e-space-1) var(--e-space-3);
    font: 500 var(--e-text-xs) / 1.3 var(--e-font-mono);
    font-variant-numeric: tabular-nums;
    color: var(--e-muted);
  }
}
</style>
