<script setup lang="ts">
import { computed, type VNodeChild } from "vue";
import AeIcon from "../Icon/AeIcon.vue";
import type { IconName } from "../../icons/phosphor.js";
import "../../styles/base.css";

export interface MetaItem {
  /** A decorative icon before the text. */
  icon?: IconName | (string & {});
  /** What the fact says, in words. A string, or a rendered VNode for rich text. */
  text: string | VNodeChild;
}

const props = defineProps<{
  /** Short facts, one per line. `null` items are skipped. */
  items: (MetaItem | null | undefined)[];
}>();

const shown = computed(() => props.items.filter((it): it is MetaItem => Boolean(it)));

/** Renders a string or VNode given as data. */
const Render = Object.assign((p: { value: VNodeChild }) => p.value, { props: ["value"] });
</script>

<template>
  <ul class="ae-meta">
    <li v-for="(item, i) in shown" :key="i">
      <AeIcon v-if="item.icon" :name="item.icon" />
      <span><Render :value="item.text" /></span>
    </li>
  </ul>
</template>

<style>
@layer ae.blocks {
  .ae-meta {
    display: grid;
    gap: var(--ae-space-2);
    margin: 0;
    padding: 0;
    list-style: none;
    font: 400 var(--ae-text-md) / 1.4 var(--ae-font-sans);
  }

  .ae-meta li {
    display: flex;
    align-items: flex-start;
    gap: var(--ae-space-2);
    min-width: 0;
  }

  .ae-meta .ae-icon {
    flex: none;
    width: 18px;
    height: 18px;
    margin-top: 2px;
  }
}
</style>
