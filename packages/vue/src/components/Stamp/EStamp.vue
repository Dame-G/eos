<script setup lang="ts">
import { computed } from "vue";
import EIcon from "../Icon/EIcon.vue";
import type { IconProp } from "../../icons/types.js";
import { useMessages } from "../../config.js";
import { useSize, type Size } from "../../composables/useSize.js";
import "../../styles/base.css";

/** `ink` is another name for `neutral`, kept so existing code works. */
export type StampTone = "neutral" | "ink" | "success" | "info" | "warning" | "danger";
export type StampStatus =
  "paid" | "due" | "overdue" | "action" | "scheduled" | "confirmed" | "cancelled" | "signed" | "pending" | "complete";

const props = defineProps<{
  /** A preset: sets the tone and the word (message `status.<name>`). */
  status?: StampStatus;
  /** Overrides the preset's tone. Without a `status` the stamp is `neutral` (`ink` is another name for it). `success`, `info`, `warning` and `danger` colour it. */
  tone?: StampTone;
  /** The word. It overrides the preset's, and the default slot overrides both. @default preset's word, else Status */
  label?: string;
  /** A glyph before the word. */
  icon?: IconProp;
  /** A date or day count, set after the word. */
  detail?: string;
  /** `sm` is shorter, for rows and tables. */
  size?: Exclude<Size, "lg">;
  /** Shorter, for rows and tables. Same as `size="sm"`. */
  small?: boolean;
  /** Rubber-stamp ink for the one mark on a page that says a thing is final, such as PAID or VOID. Outlined, in `stamp-ink`. Use it once per screen. */
  final?: boolean;
}>();

defineSlots<{
  /** The word, instead of `label` or the preset's. Write it in sentence case. The stamp sets it in capitals. */
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
const size = useSize(props, "EStamp");
const preset = computed(() => (props.status ? PRESETS[props.status] : undefined));
const tone = computed<StampTone>(() => props.tone || preset.value || "neutral");
const toneClass = computed(() => (tone.value === "neutral" || tone.value === "ink" ? null : `e-stamp--${tone.value}`));
const text = computed(() => props.label || (preset.value ? t(`status.${props.status}`) : t("status")));
</script>

<template>
  <span class="e-stamp" :class="[toneClass, size === 'sm' && 'e-stamp--sm', final && 'e-stamp--final']">
    <EIcon v-if="icon" :name="icon" size="sm" />
    <span class="e-stamp-word"
      ><slot>{{ text }}</slot></span
    >
    <span v-if="detail" class="e-stamp-detail">{{ detail }}</span>
  </span>
</template>

<style>
@layer e.primitives {
  .e-stamp {
    --_fill: var(--e-ink);
    --_on: var(--e-surface);

    display: inline-flex;
    flex-wrap: nowrap;
    white-space: nowrap;
    align-items: center;
    gap: var(--e-gap-snug);
    min-height: calc(var(--e-chip-height) + var(--e-gap-tight));
    padding: 0 var(--e-pad-chip);
    border-radius: var(--e-radius-sm);
    background: var(--_fill);
    color: var(--_on);
  }

  .e-stamp--success {
    --_fill: var(--e-success);
    --_on: var(--e-on-success);
  }

  .e-stamp--info {
    --_fill: var(--e-info);
    --_on: var(--e-on-info);
  }

  .e-stamp--danger {
    --_fill: var(--e-danger);
    --_on: var(--e-on-danger);
  }

  .e-stamp--warning {
    --_fill: var(--e-warning);
    --_on: var(--e-on-warning);
  }

  /* The ink is a ring, not a fill, so it reads as pressed onto the page. */
  .e-stamp--final {
    background: transparent;
    color: var(--e-stamp-ink);
    box-shadow: inset 0 0 0 var(--e-stroke-card) var(--e-stamp-ink);
  }

  .e-stamp-word {
    font: var(--e-type-kicker);
    letter-spacing: var(--e-tracking-label);
    text-transform: uppercase;
  }

  .e-stamp-detail {
    font: var(--e-weight-medium) var(--e-text-xs) / var(--e-leading-none) var(--e-font-mono);
    letter-spacing: var(--e-tracking-wide);
    padding-inline-start: var(--e-gap-snug);
    border-inline-start: var(--e-stroke-hair) solid color-mix(in srgb, currentcolor 55%, transparent);
  }

  .e-stamp--sm {
    min-height: var(--e-chip-height);
    gap: var(--e-gap-tight);
  }

  @media (forced-colors: active) {
    .e-stamp {
      border: var(--e-stroke-card) solid CanvasText;
    }
  }

  @media print {
    .e-stamp {
      border: var(--e-stroke-card) solid currentcolor;
      background: none;
      box-shadow: none;
      color: var(--e-ink);
    }
  }
}
</style>
