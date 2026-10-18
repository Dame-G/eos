<script setup lang="ts">
import ESurface from "../Surface/ESurface.vue";
import EStamp from "../Stamp/EStamp.vue";
import EDescriptionList from "../DescriptionList/EDescriptionList.vue";
import EDisclosure from "../Disclosure/EDisclosure.vue";
import EAmount from "../Amount/EAmount.vue";
import ETimeline from "../Timeline/ETimeline.vue";
import type { StatementProps } from "./types.js";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

withDefaults(
  defineProps<
    StatementProps & {
      /** The heading level of the title, 1 to 4. */
      headingLevel?: 1 | 2 | 3 | 4;
    }
  >(),
  { headingLevel: 3 },
);

defineSlots<{
  /** Buttons for the bar at the foot: Pay now first, then Download. */
  actions?(): unknown;
}>();

const t = useMessages();
</script>

<template>
  <ESurface as="article" class="e-stmt" pad="md">
    <div class="e-stmt-top">
      <EStamp :status="status" :tone="tone" :label="label" :detail="detail" />
      <EAmount :label="amountLabel" :amount="amount" :details="details" :currency="currency" :locale="locale" />
    </div>
    <div class="e-stmt-head">
      <component :is="`h${headingLevel}`" class="e-stmt-title">{{ title }}</component>
      <p v-if="subtitle" class="e-stmt-sub">{{ subtitle }}</p>
    </div>
    <p v-if="reason" class="e-stmt-reason">{{ reason }}</p>
    <EDescriptionList v-if="parts && parts.length" :items="parts" />
    <EDisclosure v-if="activity && activity.length" :title="`${activityTitle || t('history')} (${activity.length})`">
      <ETimeline :items="activity" />
    </EDisclosure>
    <template v-if="$slots.actions" #actions><slot name="actions" /></template>
  </ESurface>
</template>

<style>
@layer e.account {
  .e-stmt:not(.e-surface--actions),
  .e-stmt > .e-surface-body {
    display: grid;
    align-content: start;
    gap: var(--e-space-4);
  }

  .e-stmt-top {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--e-space-3) var(--e-space-4);
  }

  .e-stmt-top .e-amount {
    margin-inline-start: auto;
    text-align: end;
    justify-items: end;
  }

  .e-stmt-top .e-amount-meta {
    justify-content: flex-end;
  }

  .e-stmt-title {
    margin: 0;
    font: 500 var(--e-text-xl) / 1.25 var(--e-font-sans);
    text-wrap: balance;
    min-width: 0;
  }

  .e-stmt-sub {
    margin: var(--e-space-1) 0 0;
    font: 400 var(--e-text-sm) / 1.4 var(--e-font-sans);
    color: var(--e-muted);
  }

  .e-stmt-reason {
    margin: 0;
    font: 400 var(--e-text-md) / 1.45 var(--e-font-sans);
    text-wrap: pretty;
  }

  @media (max-width: 32rem) {
    .e-stmt-top .e-amount {
      margin-inline-start: 0;
      text-align: start;
      justify-items: start;
    }

    .e-stmt-top .e-amount-meta {
      justify-content: flex-start;
    }
  }

  @media print {
    .e-stmt {
      box-shadow: none;
      border: 1px solid #000;
      break-inside: avoid;
    }
  }
}
</style>
