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
  <dl class="e-facts">
    <div v-for="item in items" :key="item.label" class="e-fact">
      <dt class="e-kicker">{{ item.label }}</dt>
      <dd class="e-fact-text"><Render :value="item.text" /></dd>
    </div>
  </dl>
</template>

<style>
@layer e.blocks {
  .e-facts {
    display: grid;
    margin: 0;
  }

  .e-fact {
    display: grid;
    grid-template-columns: 8rem minmax(0, 1fr);
    gap: var(--e-space-1) var(--e-space-4);
    align-items: baseline;
    padding: var(--e-space-3) 0;
    border-top: var(--e-stroke-hair) solid var(--e-border);
    min-width: 0;
  }

  .e-fact-text {
    margin: 0;
    font: 400 var(--e-text-md) / 1.45 var(--e-font-sans);
  }

  @media (max-width: 26rem) {
    .e-fact {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media print {
    .e-fact {
      box-shadow: none;
      border: 1px solid #000;
      break-inside: avoid;
      border-width: 0 0 1px;
    }
  }
}
</style>
