<script setup lang="ts">
import { computed, type VNodeChild } from "vue";
import EButton from "../Button/EButton.vue";
import EStamp from "../Stamp/EStamp.vue";
import EIcon from "../Icon/EIcon.vue";
import type { StampTone } from "../Stamp/EStamp.vue";
import type { IconProp } from "../../icons/types.js";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

export interface DescriptionItem {
  /** The label for the row. Leave it out on every row for a plain list of facts. */
  label?: string;
  /** The text beside it. A string, or a rendered VNode for rich text. */
  text: string | VNodeChild;
  /** A decorative icon before the label, or before the text in a plain list. */
  icon?: IconProp;
  /** A short word in a stamp after the text, such as "Verified". */
  badge?: string;
  /** The badge's tone. */
  badgeTone?: StampTone;
  /** Shows an Edit button at the end of the row that emits `edit`. A plain list has no Edit button and ignores it. */
  editable?: boolean;
}

const props = defineProps<{
  /** The rows, as `{ label?, text, icon?, badge?, badgeTone?, editable? }`. `null` and `undefined` items are skipped. */
  items: (DescriptionItem | null | undefined)[];
}>();

const emit = defineEmits<{
  /** An item's Edit button was pressed. */
  edit: [item: DescriptionItem, index: number];
}>();

defineSlots<{
  /** Adds content after a row's text and badge, such as a Button or IconButton. */
  action?(props: { item: DescriptionItem; index: number }): unknown;
}>();

const t = useMessages();
const shown = computed(() => props.items.filter((it): it is DescriptionItem => Boolean(it)));
/** No labels anywhere: render a plain list of facts instead of term/description pairs. */
const plain = computed(() => shown.value.length > 0 && shown.value.every((it) => !it.label));

const Render = Object.assign((p: { value: VNodeChild }) => p.value, { props: ["value"] });

function say(key: string, fallback: string, vars?: Record<string, string>) {
  const text = t(key, vars);
  return text === key ? fallback.replace(/\{(\w+)\}/g, (m, k: string) => vars?.[k] ?? m) : text;
}
</script>

<template>
  <ul v-if="plain" class="e-facts e-facts--plain">
    <li v-for="(item, i) in shown" :key="i" class="e-fact">
      <EIcon v-if="item.icon" :name="item.icon" />
      <span class="e-fact-text"><Render :value="item.text" /></span>
      <EStamp v-if="item.badge" :tone="item.badgeTone" small>{{ item.badge }}</EStamp>
      <slot name="action" :item="item" :index="i" />
    </li>
  </ul>
  <dl v-else class="e-facts">
    <div v-for="(item, i) in shown" :key="i" class="e-fact">
      <dt class="e-kicker">
        <EIcon v-if="item.icon" :name="item.icon" />{{ item.label }}
      </dt>
      <dd class="e-fact-text">
        <span class="e-fact-value"><Render :value="item.text" /></span>
        <EStamp v-if="item.badge" :tone="item.badgeTone" small>{{ item.badge }}</EStamp>
        <slot name="action" :item="item" :index="i" />
        <EButton
          v-if="item.editable"
          variant="quiet"
          :aria-label="say('editItem', 'Edit {label}', { label: item.label ?? '' })"
          @click="emit('edit', item, i)"
        >
          {{ say("edit", "Edit") }}
        </EButton>
      </dd>
    </div>
  </dl>
</template>

<style>
@layer e.blocks {
  .e-facts {
    display: grid;
    margin: 0;
    padding: 0;
    list-style: none;
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

  .e-fact:first-child {
    border-top: 0;
  }

  .e-fact > .e-kicker {
    display: flex;
    align-items: center;
    gap: var(--e-space-2);
  }

  .e-fact > .e-kicker .e-icon {
    flex: none;
    width: 1.125rem;
    height: 1.125rem;
  }

  .e-fact-text {
    display: flex;
    align-items: center;
    gap: var(--e-space-3);
    margin: 0;
    min-width: 0;
    font: 400 var(--e-text-md) / 1.45 var(--e-font-sans);
  }

  .e-fact-value {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .e-fact-text > :not(.e-fact-value) {
    flex: none;
  }

  /* Plain list: icon, text, then the end. */
  .e-facts--plain {
    gap: var(--e-space-2);
  }

  .e-facts--plain > .e-fact {
    display: flex;
    align-items: flex-start;
    gap: var(--e-space-2);
    padding: 0;
    border-top: 0;
  }

  .e-facts--plain > .e-fact > .e-icon {
    flex: none;
    width: 1.125rem;
    height: 1.125rem;
    margin-top: var(--e-space-1);
  }

  .e-facts--plain > .e-fact > .e-fact-text {
    flex: 1;
    display: block;
    line-height: 1.4;
  }

  @media (max-width: 26rem) {
    .e-fact {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media print {
    .e-fact {
      box-shadow: none;
      outline: 0;
      border: 0 solid var(--e-print-ink);
      border-width: 0 0 var(--e-stroke-hair);
      break-inside: avoid;
    }

    .e-fact .e-btn {
      display: none;
    }
  }
}
</style>
