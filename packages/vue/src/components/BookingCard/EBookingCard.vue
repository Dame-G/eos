<script setup lang="ts">
import { computed } from "vue";
import ESurface from "../Surface/ESurface.vue";
import EAvatar from "../Avatar/EAvatar.vue";
import EStamp from "../Stamp/EStamp.vue";
import EMetaList from "../MetaList/EMetaList.vue";
import type { StampStatus, StampTone } from "../Stamp/EStamp.vue";
import { useMessages } from "../../config.js";
import { useLocale } from "../../composables/useLocale.js";
import "../../styles/base.css";

export interface BookingProvider {
  /** Who leads the card. Also the photo's accessible name and the source of the initials. */
  name: string;
  /** Their role, on the line under the name. */
  role?: string;
  /** A photo URL. Initials show without one. */
  photo?: string;
}

const props = withDefaults(
  defineProps<{
    /** The day, as a Date. Shown in the date tile and in words in the list of facts. */
    date: Date;
    /** The time, as you want it read: "9:30 am". */
    time: string;
    /** The kind of booking. With a provider it sits at the end of the role line; without, it takes the name's line. */
    title: string;
    /** A line under the title when there is no provider. */
    subtitle?: string;
    /** Who the booking is with: photo, name and role lead the card. Without one, the date tile leads. */
    provider?: BookingProvider;
    /** Where it happens. */
    location?: string;
    /** A preset for the stamp at the end of the title line. */
    status?: StampStatus;
    /** Overrides the status's tone. */
    tone?: StampTone;
    /** The stamp's word. Overrides the status's; on its own it shows a stamp too. */
    label?: string;
    /** The heading level of the name or title, 1 to 4. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  }>(),
  { headingLevel: 3 },
);

defineSlots<{
  /** Buttons for the tinted bar at the foot. The bar is left out when there are none. */
  actions?(): unknown;
}>();

const t = useMessages();
const { monthsShort, formatLong } = useLocale();
const who = computed(() => props.provider?.name);
const facts = computed(() => [
  { icon: "calendar", text: t("dateAtTime", { date: formatLong(props.date), time: props.time }) },
  props.location ? { icon: "pin", text: props.location } : null,
]);
</script>

<template>
  <ESurface as="article" class="e-appt">
    <div class="e-appt-main">
      <EAvatar v-if="who" :name="who" :src="provider?.photo" large />
      <div v-else class="e-appt-date" aria-hidden="true">
        <span class="e-appt-month">{{ monthsShort[date.getMonth()] }}</span>
        <span class="e-appt-day">{{ date.getDate() }}</span>
      </div>
      <div class="e-appt-body">
        <div class="e-appt-head">
          <component :is="`h${headingLevel}`" class="e-appt-title">{{ who || title }}</component>
          <EStamp v-if="status || label" :status="status" :tone="tone" :label="label" small />
        </div>
        <p class="e-appt-sub">
          <template v-if="who">
            <span v-if="provider?.role" class="e-appt-role">{{ provider.role }}</span>
            <span class="e-appt-kind">{{ title }}</span>
          </template>
          <span v-else-if="subtitle" class="e-appt-role">{{ subtitle }}</span>
        </p>
      </div>
      <EMetaList class="e-appt-facts" :items="facts" />
    </div>
    <template v-if="$slots.actions" #actions><slot name="actions" /></template>
  </ESurface>
</template>

<style>
@layer e.account {
  .e-appt {
    container: e-appt / inline-size;
    overflow: hidden;
  }

  .e-appt .e-appt-main {
    height: 100%;
  }

  .e-appt-main {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-rows: minmax(4rem, auto) auto;
    gap: var(--e-space-3) var(--e-space-4);
    align-items: start;
    padding: var(--e-space-4);
  }

  .e-appt-date {
    display: grid;
    grid-template-rows: auto 1fr;
    justify-items: stretch;
    width: 64px;
    overflow: hidden;
    border: 1.5px solid var(--e-border-strong);
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
    text-align: center;
  }

  .e-appt-month {
    padding: 4px 0 3px;
    background: var(--e-surface-tint);
    border-bottom: 1.5px solid var(--e-border-strong);
    font: 600 var(--e-text-xs) / 1.2 var(--e-font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--e-primary);
  }

  .e-appt-day {
    padding: 5px 0 7px;
    font: 500 var(--e-text-2xl) / 1 var(--e-font-mono);
    font-variant-numeric: tabular-nums;
  }

  .e-appt-body {
    display: grid;
    gap: var(--e-space-1);
    min-width: 0;
  }

  .e-appt-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--e-space-1) var(--e-space-3);
  }

  .e-appt-head:empty {
    display: none;
  }

  .e-appt-head .e-appt-title {
    flex: 1 1 8rem;
  }

  .e-appt-sub {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0 var(--e-space-4);
    min-height: calc(var(--e-text-md) * 1.4);
    margin: 0;
    font: 400 var(--e-text-sm) / 1.4 var(--e-font-sans);
  }

  .e-appt-head .e-stamp {
    margin-inline-start: auto;
  }

  .e-appt-title {
    margin: 0;
    font: 500 var(--e-text-2xl) / 1.25 var(--e-font-sans);
    text-wrap: balance;
    overflow-wrap: anywhere;
  }

  .e-appt-role {
    margin: 0;
    font: 400 var(--e-text-sm) / 1.4 var(--e-font-sans);
    color: var(--e-muted);
  }

  .e-appt-facts {
    grid-column: 2;
    margin: 0;
    padding: var(--e-space-3) 0 0;
    border-top: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-appt-kind {
    margin-inline-start: auto;
    color: var(--e-ink);
    font-size: var(--e-text-md);
    font-weight: 500;
  }

  @container e-appt (max-width: 24rem) {
    .e-appt-head {
      display: contents;
    }

    .e-appt-head .e-appt-title {
      flex: none;
    }

    .e-appt-head .e-stamp {
      order: 1;
      justify-self: start;
      margin-inline-start: 0;
    }

    .e-appt-facts {
      grid-column: 1 / -1;
    }
  }

  @media print {
    .e-appt {
      box-shadow: none;
      border: 1px solid #000;
      break-inside: avoid;
    }
  }
}
</style>
