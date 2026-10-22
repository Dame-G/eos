<script setup lang="ts">
import { computed } from "vue";
import EActions from "../Actions/EActions.vue";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The element to render, such as `article`, `section` or `aside` for a real block. */
    as?: string;
    /** Padding inside the card: `sm`, `md` or `lg`. */
    pad?: "sm" | "md" | "lg";
    /** The lifted shadow of something floating above the page, such as a Toast. */
    raised?: boolean;
    /** Hides what overflows the rounded corners. Ignored when there is an `actions` slot. */
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

const pad = computed(() => (props.pad ? `e-surface--pad-${props.pad}` : null));
const barElement = computed(() => (/^(article|section|aside)$/.test(props.as) ? "footer" : "div"));
</script>

<template>
  <component
    :is="as"
    class="e-surface"
    :class="[raised && 'e-surface--raised', $slots.actions ? 'e-surface--actions' : [pad, clip && 'e-surface--clip']]"
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

  .e-surface--raised {
    box-shadow: var(--e-float);
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
      outline: 0;
      border: var(--e-stroke-hair) solid var(--e-print-ink, #000);
      break-inside: avoid;
    }
  }

  @media (forced-colors: active) {
    .e-surface {
      outline-color: CanvasText;
    }
  }
}
</style>
