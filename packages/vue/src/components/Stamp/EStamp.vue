<script setup lang="ts">
import { computed } from "vue";
import EIcon from "../Icon/EIcon.vue";
import type { IconProp } from "../../icons/types.js";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

export type StampTone = "neutral" | "ink" | "success" | "info" | "warning" | "danger";
export type StampStatus =
  "paid" | "due" | "overdue" | "action" | "scheduled" | "confirmed" | "cancelled" | "signed" | "pending" | "complete";

const props = defineProps<{
  /** A preset: sets the tone and the word (message `status.<name>`). */
  status?: StampStatus;
  /** Overrides the preset's tone. Without a status it is `neutral` (ink; `ink` is the same). `success`: paid, confirmed. `info`: due, scheduled. `warning`: needs attention. `danger`: overdue, failed. @default "ink" */
  tone?: StampTone;
  /** The word. Overrides the preset's; the default slot overrides both. @default preset's word, else Status */
  label?: string;
  /** A glyph before the word. None by default. */
  icon?: IconProp;
  /** A date or day count, set after the word. */
  detail?: string;
  /** Shorter, for rows and tables. */
  small?: boolean;
}>();

defineSlots<{
  /** The word, instead of `label` or the preset's. Write sentence case; the stamp sets it in capitals. */
  default?(): unknown;
}>();

const PRESETS: Record<StampStatus, StampTone> = {
  paid: "success",
  due: "info",
  overdue: "danger",
  action: "warning",
  scheduled: "info",
  confirmed: "success",
  cancelled: "danger",
  signed: "success",
  pending: "info",
  complete: "success",
};

const t = useMessages();
const preset = computed(() => (props.status ? PRESETS[props.status] : undefined));
const tone = computed<StampTone>(() => props.tone || preset.value || "neutral");
const toneClass = computed(() => (tone.value === "neutral" || tone.value === "ink" ? null : `e-stamp--${tone.value}`));
const text = computed(() => props.label || (preset.value ? t(`status.${props.status}`) : t("status")));
</script>

<template>
  <span class="e-stamp" :class="[toneClass, small && 'e-stamp--sm']">
    <EIcon v-if="icon" :name="icon" bold />
    <span class="e-stamp-word"><slot>{{ text }}</slot></span>
    <span v-if="detail" class="e-stamp-detail">{{ detail }}</span>
  </span>
</template>

<style>
@layer e.primitives {
  .e-stamp {
    --e-soft: var(--e-surface-tint);
    --e-strong: var(--e-ink);
    --e-on: var(--e-surface);

    display: inline-flex;
    flex-wrap: nowrap;
    white-space: nowrap;
    align-items: center;
    gap: var(--e-space-2);
    min-height: calc(var(--e-chip-height) + var(--e-space-1));
    padding: 0 var(--e-space-3);
    border-radius: var(--e-radius-sm);
    background: var(--e-strong);
    color: var(--e-on);
    cursor: default;
    justify-self: start;
  }

  .e-stamp--success {
    --e-soft: var(--e-secondary-soft);
    --e-strong: var(--e-secondary);
    --e-on: var(--e-on-secondary);
  }

  .e-stamp--info {
    --e-soft: var(--e-surface-tint);
    --e-strong: var(--e-primary);
    --e-on: var(--e-on-primary);
  }

  .e-stamp--danger {
    --e-soft: var(--e-danger-soft);
    --e-strong: var(--e-danger);
    --e-on: var(--e-on-danger);
  }

  .e-stamp--warning {
    --e-soft: var(--e-warning-soft);
    --e-strong: var(--e-warning-strong);
    --e-on: var(--e-surface);
  }

  .e-stamp .e-stamp-detail {
    border-inline-start-color: color-mix(in srgb, var(--e-on) 55%, transparent);
  }

  .e-stamp-word {
    font: 600 var(--e-text-xs) / 16px var(--e-font-mono);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .e-stamp-detail {
    font: 500 var(--e-text-xs) / 1 var(--e-font-mono);
    letter-spacing: 0.04em;
    padding-inline-start: var(--e-space-2);
    border-inline-start: var(--e-stroke-hair) solid currentColor;
  }

  .e-stamp .e-icon {
    width: 14px;
    height: 14px;
  }

  .e-stamp--sm {
    min-height: var(--e-chip-height);
    gap: var(--e-space-1);
    align-self: flex-start;
  }

  .e-stamp--sm .e-icon {
    width: 13px;
    height: 13px;
  }

  .e-stamp--sm .e-stamp-word {
    font-size: var(--e-text-xs);
    line-height: 14px;
    letter-spacing: 0.06em;
  }

  @media (forced-colors: active) {
    .e-stamp {
      border: var(--e-stroke-card) solid CanvasText;
    }
  }

  @media print {
    .e-stamp {
      border: var(--e-stroke-card) solid var(--e-print-ink);
      outline: 0;
      background: none;
      box-shadow: none;
      color: var(--e-print-ink);
    }
  }
}
</style>
