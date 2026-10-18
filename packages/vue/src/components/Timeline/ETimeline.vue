<script setup lang="ts">
import EChip from "../Chip/EChip.vue";
import type { ChipTone } from "../Chip/EChip.vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

export interface TimelineItem {
  /** Who did it: `you`, `team` or `system` (an automatic event). Sets the source chip. */
  kind: "you" | "team" | "you" | "team" | "system";
  /** What happened, as a sentence. */
  note: string;
  /** When it happened and from where, such as "Oct 12, 9:41 am, online". Never leave it out. */
  source: string;
}

defineProps<{
  /** The events, newest first. */
  items: TimelineItem[];
}>();

const t = useMessages();
const KINDS: Record<TimelineItem["kind"], { label: "you" | "team" | "automatic"; tone: ChipTone }> = {
  you: { label: "you", tone: "neutral" },
  team: { label: "team", tone: "info" },
  system: { label: "automatic", tone: "neutral" },
};
const kindOf = (kind: string) => KINDS[kind as TimelineItem["kind"]] ?? KINDS.system;
</script>

<template>
  <ol class="e-activity" :aria-label="t('activity')">
    <li v-for="(item, i) in items" :key="i" class="e-activity-row">
      <EChip :tone="kindOf(item.kind).tone">{{ t(kindOf(item.kind).label) }}</EChip>
      <p class="e-activity-main">{{ item.note }}</p>
      <p class="e-activity-source">{{ item.source }}</p>
    </li>
  </ol>
</template>

<style>
@layer e.account {
  .e-activity {
    display: grid;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .e-activity-row {
    display: grid;
    grid-template-columns: 5.5rem minmax(0, 1fr);
    gap: var(--e-space-1) var(--e-space-4);
    align-items: start;
    padding: var(--e-space-3) 0;
    border-top: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-activity-row:first-child {
    border-top: 0;
    padding-top: 0;
  }

  .e-activity-row .e-chip {
    justify-self: start;
  }

  .e-activity-main {
    margin: 0;
    font: 400 var(--e-text-md) / 1.5 var(--e-font-sans);
    min-width: 0;
  }

  .e-activity-source {
    margin: 0;
    grid-column: 2;
    font: 400 var(--e-text-sm) / 1.4 var(--e-font-sans);
    color: var(--e-muted);
    min-width: 0;
  }
}
</style>
