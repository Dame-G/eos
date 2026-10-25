<script setup lang="ts">
import { computed } from "vue";
import EIcon from "../Icon/EIcon.vue";
import type { IconProp } from "../../icons/types.js";
import { useMessages } from "../../config.js";
import type { Size, Tone } from "../../composables/useSize.js";
import "../../styles/base.css";

/** The tones a stamp takes. */
export type StampTone = Extract<Tone, "neutral" | "success" | "info" | "warning" | "danger">;
export type StampStatus =
  "paid" | "due" | "overdue" | "action" | "scheduled" | "confirmed" | "cancelled" | "signed" | "pending" | "complete";

const props = withDefaults(
  defineProps<{
    /** A preset: sets the tone and the word (message `status.<name>`). */
    status?: StampStatus;
    /** Overrides the preset's tone. Without a `status` the stamp is `neutral`. `success`, `info`, `warning` and `danger` colour it. */
    tone?: StampTone;
    /** The word. It overrides the preset's, and the default slot overrides both. @default preset's word, else Status */
    label?: string;
    /** A glyph before the word. */
    icon?: IconProp;
    /** A date or day count, set after the word. */
    detail?: string;
    /** `sm` is shorter, for rows and tables. */
    size?: Extract<Size, "sm" | "md">;
    /** Rubber-stamp ink for the one mark on a page that says a thing is final, such as PAID or VOID. Outlined, in `stamp-ink`. Use it once per screen. */
    final?: boolean;
  }>(),
  { size: "md" },
);

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
const preset = computed(() => (props.status ? PRESETS[props.status] : undefined));
const tone = computed<StampTone>(() => props.tone || preset.value || "neutral");
const toneClass = computed(() => (tone.value === "neutral" ? null : `e-stamp--${tone.value}`));
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
  /* A tinted chip with an edge in its tone, and a thick side on the inline-start edge, as a Notice has. The side flips in a right-to-left page. */
  .e-stamp {
    --_tone: var(--e-muted);
    --_bg: var(--e-surface-tint);
    --_ink: var(--e-ink);

    display: inline-flex;
    flex-wrap: nowrap;

    /* As wide as its content, also as the child of a grid or a column, which would otherwise stretch it. */
    inline-size: fit-content;
    max-inline-size: 100%;
    white-space: nowrap;
    align-items: center;
    gap: var(--e-gap-snug);
    min-height: calc(var(--e-chip-height) + var(--e-gap-tight));
    padding-block: 0;
    padding-inline: calc(var(--e-pad-chip) - var(--e-stroke-edge) - var(--e-slab-bold))
      calc(var(--e-pad-chip) - var(--e-stroke-edge));
    border: var(--e-stroke-edge) solid var(--_tone);
    border-inline-start-width: calc(var(--e-stroke-edge) + var(--e-slab-bold));
    border-radius: var(--e-radius-sm);
    background-color: var(--_bg);
    background-clip: padding-box;
    color: var(--_ink);
  }

  .e-stamp--success {
    --_tone: var(--e-success);
    --_bg: var(--e-success-soft);
    --_ink: var(--e-success);
  }

  .e-stamp--info {
    --_tone: var(--e-info);
    --_bg: var(--e-info-soft);
    --_ink: var(--e-info);
  }

  .e-stamp--danger {
    --_tone: var(--e-danger);
    --_bg: var(--e-danger-soft);
    --_ink: var(--e-danger);
  }

  .e-stamp--warning {
    --_tone: var(--e-warning);
    --_bg: var(--e-warning-soft);
    --_ink: var(--e-warning);
  }

  /* The ink is a ring, not a tint, so it reads as pressed onto the page. */
  .e-stamp--final {
    padding-inline: var(--e-pad-chip);
    border: 0;
    background: transparent;
    color: var(--e-stamp-ink);
    box-shadow: inset 0 0 0 var(--e-stroke-card) var(--e-stamp-ink);
  }

  /* The word and the detail share the kicker line height (`leading-tight`), so their baselines meet and the text sits on one line whichever way the row is centred. Capitals have no descenders, so a line box centres them high; a little space above the text moves the capitals to the middle of the stamp. */
  .e-stamp-word {
    padding-block-start: 0.15em;
    font: var(--e-type-kicker);
    letter-spacing: var(--e-tracking-label);
    text-transform: uppercase;
  }

  .e-stamp-detail {
    padding-block-start: 0.15em;
    font: var(--e-weight-medium) var(--e-text-xs) / var(--e-leading-tight) var(--e-font-mono);
    letter-spacing: var(--e-tracking-wide);
    padding-inline-start: var(--e-gap-snug);
    border-inline-start: var(--e-stroke-hair) solid color-mix(in srgb, currentcolor 55%, transparent);
  }

  /* Where the browser can trim a line box to the capitals, the stamp centres the capitals themselves, whatever the font, size or text scale, and the nudge above is not needed. */
  @supports (text-box: trim-both cap alphabetic) {
    .e-stamp-word,
    .e-stamp-detail {
      padding-block-start: 0;
      text-box: trim-both cap alphabetic;
    }
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
