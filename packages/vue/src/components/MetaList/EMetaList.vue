<script setup lang="ts">
import { computed, type VNodeChild } from "vue";
import EIcon from "../Icon/EIcon.vue";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";

export interface MetaItem {
  /** A decorative icon before the text. */
  icon?: IconProp;
  /** What the fact says, in words. A string, or a rendered VNode for rich text. */
  text: string | VNodeChild;
}

const props = defineProps<{
  /** Short facts, one per line. `null` items are skipped. */
  items: (MetaItem | null | undefined)[];
}>();

const shown = computed(() => props.items.filter((it): it is MetaItem => Boolean(it)));

const Render = Object.assign((p: { value: VNodeChild }) => p.value, { props: ["value"] });
</script>

<template>
  <ul class="e-meta">
    <li v-for="(item, i) in shown" :key="i">
      <EIcon v-if="item.icon" :name="item.icon" />
      <span><Render :value="item.text" /></span>
    </li>
  </ul>
</template>

<style>
@layer e.blocks {
  .e-meta {
    display: grid;
    gap: var(--e-space-2);
    margin: 0;
    padding: 0;
    list-style: none;
    font: 400 var(--e-text-md) / 1.4 var(--e-font-sans);
  }

  .e-meta li {
    display: flex;
    align-items: flex-start;
    gap: var(--e-space-2);
    min-width: 0;
  }

  .e-meta .e-icon {
    flex: none;
    width: 18px;
    height: 18px;
    margin-top: 2px;
  }
}
</style>
