<script setup lang="ts">
import { computed } from "vue";
import EActions from "../Actions/EActions.vue";
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

const tone = computed(() => (props.tone && props.tone !== "default" ? `e-surface--${props.tone}` : null));
const pad = computed(() => (props.pad ? `e-surface--pad-${props.pad}` : null));
const barElement = computed(() => (/^(article|section|aside)$/.test(props.as) ? "footer" : "div"));
</script>

<template>
  <component
    :is="as"
    class="e-surface"
    :class="[tone, $slots.actions ? 'e-surface--actions' : [pad, clip && 'e-surface--clip']]"
  >
    <template v-if="$slots.actions">
      <div class="e-surface-body" :class="pad">
        <slot />
      </div>
      <EActions :as="barElement" bar>
        <slot name="actions" />
      </EActions>
    </template>
    <slot v-else />
  </component>
</template>

<style>
@layer e.blocks {
  .e-surface {
    min-width: 0;
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
    box-shadow: var(--e-edge);
  }

  .e-surface--tint {
    background: var(--e-surface-tint);
  }

  .e-surface--clip {
    overflow: hidden;
  }

  .e-surface--actions {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .e-surface-body {
    flex: 1;
    min-width: 0;
  }

  .e-surface > .e-actions--bar:last-child {
    border-end-start-radius: var(--e-radius-md);
    border-end-end-radius: var(--e-radius-md);
  }

  .e-surface--float {
    box-shadow:
      0 0 0 1px var(--e-border),
      var(--e-float);
  }

  .e-surface--pad-sm {
    padding: var(--e-space-3) var(--e-space-4);
  }

  .e-surface--pad-md {
    padding: var(--e-space-4);
  }

  .e-surface--pad-lg {
    padding: var(--e-space-6);
  }

  @media print {
    .e-surface {
      box-shadow: none;
      border: 1px solid #000;
      break-inside: avoid;
    }
  }
}
</style>
