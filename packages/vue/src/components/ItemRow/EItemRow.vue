<script setup lang="ts">
import { h, inject, type FunctionalComponent } from "vue";
import EIcon from "../Icon/EIcon.vue";
import EStamp from "../Stamp/EStamp.vue";
import EItemList from "../ItemList/EItemList.vue";
import { ITEM_LIST_KEY } from "../ItemList/context.js";
import type { StampStatus, StampTone } from "../Stamp/EStamp.vue";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";

defineOptions({ inheritAttrs: false });

defineProps<{
  /** What the line is, such as "New client form". */
  title: string;
  /** A line under the title, such as when it is due. */
  subtitle?: string;
  /** An icon in a tile before the title. */
  icon?: IconProp;
  /** A preset for the stamp: sets its tone, word and glyph. */
  status?: StampStatus;
  /** Overrides the status's tone. */
  tone?: StampTone;
  /** The stamp's word. Overrides the status's; on its own it shows a stamp too. */
  label?: string;
}>();

defineSlots<{
  /** A Button or IconButton at the end of the row. */
  action?(): unknown;
}>();

const inList = inject(ITEM_LIST_KEY, false);
/** The row as it is when it sits in a list, wrapped in one when it stands alone. */
const Frame: FunctionalComponent = (_props, { slots }) =>
  inList ? slots.default?.() : h(EItemList, null, { default: () => slots.default?.() });
</script>

<template>
  <Frame>
    <div class="e-item" role="listitem" v-bind="$attrs">
      <span v-if="icon" class="e-item-icon"><EIcon :name="icon" /></span>
      <div class="e-item-main">
        <p class="e-item-title">{{ title }}</p>
        <p v-if="subtitle" class="e-item-sub">{{ subtitle }}</p>
      </div>
      <EStamp v-if="status || label" :status="status" :tone="tone" :label="label" small />
      <slot name="action" />
    </div>
  </Frame>
</template>

<style>
@layer e.account {
  .e-item {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
    align-items: center;
    padding: var(--e-space-3) 0;
    border-top: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-item:first-child {
    border-top: 0;
  }

  .e-item-icon {
    grid-column: 1;
    grid-row: 1 / span 2;
    align-self: start;
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: var(--e-radius-md);
    background: var(--e-surface-tint);
    box-shadow: inset 0 0 0 1px var(--e-border-strong);
  }

  .e-item-icon .e-icon {
    width: 22px;
    height: 22px;
  }

  .e-item-main {
    grid-column: 2;
    grid-row: 1;
    min-width: 0;
  }

  .e-item .e-stamp {
    grid-column: 2;
    grid-row: 2;
    justify-self: start;
    margin-top: var(--e-space-2);
  }

  .e-item > .e-btn {
    grid-column: 2 / -1;
    grid-row: 3;
    justify-self: start;
    margin-top: var(--e-space-3);
  }

  .e-item > .e-icon-btn {
    grid-column: 3;
    grid-row: 1 / span 2;
    /* stylelint-disable-next-line declaration-block-no-redundant-longhand-properties -- two longhands, as in the reference */
    justify-self: end;
    align-self: center;
  }

  .e-item-title {
    margin: 0;
    font: 500 var(--e-text-md) / 1.3 var(--e-font-sans);
    overflow-wrap: anywhere;
  }

  .e-item-sub {
    margin: var(--e-space-1) 0 0;
    font: 400 var(--e-text-sm) / 1.4 var(--e-font-sans);
    color: var(--e-muted);
  }

  @container (min-width: 36rem) {
    .e-item-icon {
      grid-row: 1;
      align-self: center;
    }

    .e-item .e-stamp {
      grid-column: 3;
      grid-row: 1;
      margin-top: 0;
      align-self: center;
    }

    .e-item > .e-btn,
    .e-item > .e-icon-btn {
      grid-column: 4;
      grid-row: 1;
      margin-top: 0;
      /* stylelint-disable-next-line declaration-block-no-redundant-longhand-properties -- two longhands, as in the reference */
      justify-self: end;
      align-self: center;
    }
  }

  @media print {
    .e-item {
      box-shadow: none;
      border: 1px solid #000;
      border-width: 0 0 1px;
      break-inside: avoid;
    }
  }
}
</style>
