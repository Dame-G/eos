<script setup lang="ts">
import { computed } from "vue";
import EIcon from "../Icon/EIcon.vue";
import type { IconName } from "../../icons/phosphor.js";
import type { IconProp } from "../../icons/types.js";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

export type StampTone = "success" | "info" | "warning" | "danger";
export type StampStatus =
  "paid" | "due" | "overdue" | "action" | "scheduled" | "confirmed" | "cancelled" | "signed" | "pending" | "complete";

const props = withDefaults(
  defineProps<{
  /** A preset: sets the tone, the word and the glyph. */
  status?: StampStatus;
  /** Overrides the preset's tone. Without a status, defaults to `info`. */
  tone?: StampTone;
  /** The word. Overrides the preset's. */
  label?: string;
  /** Overrides the preset's glyph. */
  icon?: IconProp;
  /** A date or day count, set after the word. */
  detail?: string;
  /** Smaller, for rows. */
  small?: boolean;
  /** `solid` is a filled badge with light text (the default); `subtle` is a soft tint with a tone-coloured outline and text. */
  variant?: "solid" | "subtle";
}>(),
  { variant: "solid" },
);

const PRESETS: Record<StampStatus, [StampTone, IconName]> = {
  paid: ["success", "check"],
  due: ["info", "clock"],
  overdue: ["danger", "alert"],
  action: ["warning", "alert"],
  scheduled: ["info", "calendar"],
  confirmed: ["success", "check"],
  cancelled: ["danger", "x"],
  signed: ["success", "check"],
  pending: ["info", "clock"],
  complete: ["success", "check"],
};
const TONE_ICON: Record<StampTone, IconName> = { info: "info", success: "check", warning: "alert", danger: "alert" };

const t = useMessages();
const preset = computed(() => (props.status ? PRESETS[props.status] : undefined));
const tone = computed<StampTone>(() => props.tone || preset.value?.[0] || "info");
const text = computed(() => props.label || (preset.value ? t(`status.${props.status}`) : t("status")));
const glyph = computed(() => props.icon || preset.value?.[1] || TONE_ICON[tone.value]);
</script>

<template>
  <div
    class="e-stamp"
    :class="[`e-stamp--${tone}`, small && 'e-stamp--s', variant === 'subtle' && 'e-stamp--subtle']"
    role="img"
    :aria-label="text + (detail ? ', ' + detail : '')"
  >
    <EIcon :name="glyph" bold />
    <span class="e-stamp-word">{{ text }}</span>
    <span v-if="detail" class="e-stamp-detail">{{ detail }}</span>
  </div>
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
    min-height: 28px;
    padding: 0 var(--e-space-3);
    border-radius: var(--e-radius-sm);
    background: var(--e-strong);
    color: var(--e-on);
    box-shadow: inset 0 0 0 var(--e-stroke-card) var(--e-strong);
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

  .e-stamp--subtle {
    background: var(--e-soft);
    color: var(--e-strong);
  }

  .e-stamp:not(.e-stamp--subtle) .e-stamp-detail {
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
    border-inline-start: 1px solid currentColor;
  }

  .e-stamp .e-icon {
    width: 14px;
    height: 14px;
  }

  .e-stamp--s {
    min-height: 24px;
    gap: 6px;
    padding: 0 10px;
    align-self: flex-start;
  }

  .e-stamp--s .e-icon {
    width: 13px;
    height: 13px;
  }

  .e-stamp--s .e-stamp-word {
    font-size: var(--e-text-xs);
    line-height: 14px;
    letter-spacing: 0.06em;
  }

  @media (forced-colors: active) {
    .e-stamp {
      border: 1px solid CanvasText;
    }
  }

  @media print {
    .e-stamp {
      border: 1px solid #000;
      background: none;
      color: #000;
    }
  }
}
</style>
