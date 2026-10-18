<script setup lang="ts">
import type { VNodeChild } from "vue";
import "../../styles/base.css";

export interface DescriptionItem {
  /** The label, shown as a small uppercase kicker. */
  label: string;
  /** The text beside it. A string, or a rendered VNode for rich text. */
  text: string | VNodeChild;
}

defineProps<{
  /** Label and text rows, ruled apart. */
  items: DescriptionItem[];
}>();

/** Renders a string or VNode given as data. */
const Render = Object.assign((p: { value: VNodeChild }) => p.value, { props: ["value"] });
</script>

<template>
  <dl class="ae-facts">
    <div v-for="item in items" :key="item.label" class="ae-fact">
      <dt class="ae-kicker">{{ item.label }}</dt>
      <dd class="ae-fact-text"><Render :value="item.text" /></dd>
    </div>
  </dl>
</template>

<style>
@layer ae.blocks {
  .ae-facts {
    display: grid;
    margin: 0;
  }

  .ae-fact {
    display: grid;
    grid-template-columns: 8rem minmax(0, 1fr);
    gap: var(--ae-space-1) var(--ae-space-4);
    align-items: baseline;
    padding: var(--ae-space-3) 0;
    border-top: var(--ae-stroke-hair) solid var(--ae-border);
    min-width: 0;
  }

  .ae-fact-text {
    margin: 0;
    font: 400 var(--ae-text-md) / 1.45 var(--ae-font-sans);
  }

  @media (max-width: 26rem) {
    .ae-fact {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media print {
    .ae-fact {
      box-shadow: none;
      border: 1px solid #000;
      break-inside: avoid;
      border-width: 0 0 1px;
    }
  }
}
</style>
