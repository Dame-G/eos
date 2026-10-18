<script setup lang="ts">
import { computed } from "vue";
import AeActions from "../Actions/AeActions.vue";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The element to render, `div` by default. */
    as?: string;
    /** Padding: `sm`, `md` or `lg`. Omit for none. */
    pad?: "sm" | "md" | "lg";
    /** `default`, `tint` (the tinted look) or `float` (the lifted look of a Toast). */
    tone?: "default" | "tint" | "float";
    /** Hides what overflows the rounded corners. */
    clip?: boolean;
  }>(),
  { as: "div" },
);

defineSlots<{
  /** The content of the card. */
  default(): unknown;
  /** Buttons for a bar at the foot of the card, edge to edge. The body takes the remaining height so cards in a row end level. */
  actions(): unknown;
}>();

const tone = computed(() => (props.tone && props.tone !== "default" ? `ae-surface--${props.tone}` : null));
const pad = computed(() => (props.pad ? `ae-surface--pad-${props.pad}` : null));
const barElement = computed(() => (/^(article|section|aside)$/.test(props.as) ? "footer" : "div"));
</script>

<template>
  <component
    :is="as"
    class="ae-surface"
    :class="[tone, $slots.actions ? 'ae-surface--actions' : [pad, clip && 'ae-surface--clip']]"
  >
    <template v-if="$slots.actions">
      <div class="ae-surface-body" :class="pad">
        <slot />
      </div>
      <AeActions :as="barElement" bar>
        <slot name="actions" />
      </AeActions>
    </template>
    <slot v-else />
  </component>
</template>

<style>
@layer ae.blocks {
  .ae-surface {
    min-width: 0;
    border-radius: var(--ae-radius-md);
    background: var(--ae-surface);
    box-shadow: var(--ae-edge);
  }

  .ae-surface--tint {
    background: var(--ae-surface-tint);
  }

  .ae-surface--clip {
    overflow: hidden;
  }

  .ae-surface--actions {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .ae-surface-body {
    flex: 1;
    min-width: 0;
  }

  .ae-surface > .ae-actions--bar:last-child {
    border-end-start-radius: var(--ae-radius-md);
    border-end-end-radius: var(--ae-radius-md);
  }

  .ae-surface--float {
    box-shadow:
      0 0 0 1px var(--ae-border),
      var(--ae-float);
  }

  .ae-surface--pad-sm {
    padding: var(--ae-space-3) var(--ae-space-4);
  }

  .ae-surface--pad-md {
    padding: var(--ae-space-4);
  }

  .ae-surface--pad-lg {
    padding: var(--ae-space-6);
  }

  @media print {
    .ae-surface {
      box-shadow: none;
      border: 1px solid #000;
      break-inside: avoid;
    }
  }
}
</style>
