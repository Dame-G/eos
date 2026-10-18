<script setup lang="ts">
import { computed } from "vue";
import AeIcon from "../Icon/AeIcon.vue";
import type { IconName } from "../../icons/phosphor.js";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

export type StampTone = "success" | "info" | "warning" | "danger";
export type StampStatus =
  "paid" | "due" | "overdue" | "action" | "scheduled" | "confirmed" | "cancelled" | "signed" | "pending" | "complete";

const props = defineProps<{
  /** A preset: sets the tone, the word and the glyph. */
  status?: StampStatus;
  /** Overrides the preset's tone. Without a status, defaults to `info`. */
  tone?: StampTone;
  /** The word. Overrides the preset's. */
  label?: string;
  /** Overrides the preset's glyph. */
  icon?: IconName | (string & {});
  /** A date or day count, set after the word. */
  detail?: string;
  /** Smaller, for rows. */
  small?: boolean;
}>();

/** Each preset: its tone and its glyph. The word comes from the message `status.<name>`. */
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
    class="ae-stamp"
    :class="[`ae-stamp--${tone}`, small && 'ae-stamp--s']"
    role="img"
    :aria-label="text + (detail ? ', ' + detail : '')"
  >
    <AeIcon :name="glyph" bold />
    <span class="ae-stamp-word">{{ text }}</span>
    <span v-if="detail" class="ae-stamp-detail">{{ detail }}</span>
  </div>
</template>

<style>
@layer ae.primitives {
  .ae-stamp {
    --ae-soft: var(--ae-surface-tint);
    --ae-strong: var(--ae-ink);

    display: inline-flex;
    flex-wrap: nowrap;
    white-space: nowrap;
    align-items: center;
    gap: var(--ae-space-2);
    min-height: 28px;
    padding: 0 var(--ae-space-3);
    border-radius: var(--ae-radius-sm);
    background: var(--ae-soft);
    color: var(--ae-strong);
    box-shadow: inset 0 0 0 1px var(--ae-strong);
    cursor: default;
    justify-self: start;
  }

  .ae-stamp--success {
    --ae-soft: var(--ae-secondary-soft);
    --ae-strong: var(--ae-secondary);
  }

  .ae-stamp--info {
    --ae-soft: var(--ae-surface-tint);
    --ae-strong: var(--ae-primary);
  }

  .ae-stamp--danger {
    --ae-soft: var(--ae-danger-soft);
    --ae-strong: var(--ae-danger);
  }

  .ae-stamp--warning {
    --ae-soft: var(--ae-warning-soft);
    --ae-strong: var(--ae-warning-strong);
  }

  .ae-stamp-word {
    font: 600 var(--ae-text-xs) / 16px var(--ae-font-mono);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .ae-stamp-detail {
    font: 500 var(--ae-text-xs) / 1 var(--ae-font-mono);
    letter-spacing: 0.04em;
    padding-inline-start: var(--ae-space-2);
    border-inline-start: 1px solid var(--ae-strong);
  }

  .ae-stamp .ae-icon {
    width: 14px;
    height: 14px;
  }

  .ae-stamp--s {
    min-height: 24px;
    gap: 6px;
    padding: 0 10px;
    align-self: flex-start;
  }

  .ae-stamp--s .ae-icon {
    width: 13px;
    height: 13px;
  }

  .ae-stamp--s .ae-stamp-word {
    font-size: var(--ae-text-xs);
    line-height: 14px;
    letter-spacing: 0.06em;
  }

  @media (forced-colors: active) {
    .ae-stamp {
      border: 1px solid CanvasText;
    }
  }

  @media print {
    .ae-stamp {
      border: 1px solid #000;
      background: none;
      color: #000;
    }
  }
}
</style>
