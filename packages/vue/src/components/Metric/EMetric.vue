<script lang="ts">
export type MetricTrend = "up" | "down" | "flat";
</script>

<script setup lang="ts">
import { computed } from "vue";
import EIcon from "../Icon/EIcon.vue";
import EKicker from "../Kicker/EKicker.vue";
import { useMessages } from "../../config.js";
import { useLocale } from "../../composables/useLocale.js";
import type { Tone } from "../../types.js";
import { warnOnce } from "../../warn.js";
import "../../styles/base.css";

const props = defineProps<{
  /** What is measured, as a short label above the figure. */
  label: string;
  /** The figure. A number is formatted for the locale; a string is shown as given, so format a currency or a unit yourself. */
  value: number | string;
  /** The change, written as you want it shown, such as "+4.2%" or "12 more than last month". Set `trend` with it. */
  delta?: string;
  /** The direction of the change. It chooses the arrow and the colour, and is read out with the delta ("Up +4.2%"). */
  trend?: MetricTrend;
  /** The colour of the change, when it is not what the direction suggests: `danger` for a cost that went up. Left out, up is `success`, down is `danger` and flat is `muted`. `neutral` is the deprecated name of `muted`. */
  tone?: "muted" | Extract<Tone, "success" | "danger" | "neutral">;
  /** A line of explanation under the figure, such as the period it covers. */
  help?: string;
}>();

defineSlots<{
  /** The help line, instead of `help`, for text with a link. */
  help?(): unknown;
}>();

const t = useMessages();
const loc = useLocale();
if (props.tone === "neutral")
  warnOnce("EMetric-neutral", 'EMetric tone="neutral" is renamed tone="muted"; neutral will mean the default.');
const shown = computed(() => (typeof props.value === "number" ? loc.formatNumber(props.value) : props.value));
const tone = computed(() => {
  const given = props.tone === "neutral" ? "muted" : props.tone;
  return given ?? (props.trend === "up" ? "success" : props.trend === "down" ? "danger" : "muted");
});
const deltaText = computed(() =>
  props.delta && props.trend
    ? t(props.trend === "up" ? "trendUp" : props.trend === "down" ? "trendDown" : "trendFlat", { delta: props.delta })
    : props.delta,
);
const ICON = { up: "arrow-up", down: "arrow-down", flat: "minus" } as const;
</script>

<template>
  <dl class="e-metric">
    <EKicker as="dt">{{ label }}</EKicker>
    <dd class="e-metric-value e-numeral-l">{{ shown }}</dd>
    <dd v-if="delta" class="e-metric-delta" :class="`e-metric-delta--${tone}`">
      <EIcon v-if="trend" :name="ICON[trend]" size="sm" />
      <span class="e-sr">{{ deltaText }}</span>
      <span aria-hidden="true">{{ delta }}</span>
    </dd>
    <dd v-if="help || $slots.help" class="e-metric-help">
      <slot name="help">{{ help }}</slot>
    </dd>
  </dl>
</template>

<style>
@layer e.primitives {
  .e-metric {
    display: grid;
    justify-items: start;
    gap: var(--e-gap-tight);
    margin: 0;
    min-width: 0;
  }

  .e-metric > dd {
    margin: 0;
  }

  .e-metric-value {
    overflow-wrap: anywhere;
  }

  .e-metric-delta {
    display: inline-flex;
    align-items: center;
    gap: var(--e-gap-tight);
    font: var(--e-type-numeral);
    color: var(--e-muted);
  }

  .e-metric-delta--success {
    color: var(--e-success);
  }

  .e-metric-delta--danger {
    color: var(--e-danger);
  }

  .e-metric-help {
    font: var(--e-type-small);
    color: var(--e-muted);
  }
}
</style>
