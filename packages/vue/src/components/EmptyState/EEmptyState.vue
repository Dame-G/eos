<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";
import "../Heading/scale.css";

withDefaults(
  defineProps<{
    /** An icon above the title. */
    icon?: IconProp;
    /** What is missing, in the person's words. */
    title: string;
    /** The level of the title's heading element, 1 to 6, chosen to fit the page outline. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Removes the outline, for use inside a table or panel. */
    bare?: boolean;
    /** `danger` colours the icon in the error colour, for a failed load or a search that broke rather than one that found nothing. */
    tone?: "neutral" | "danger";
    /** `sm` is more compact with a smaller icon, for use inside a panel or a table. */
    size?: "sm" | "md";
  }>(),
  { headingLevel: 3, tone: "neutral", size: "md" },
);

defineSlots<{
  /** One or two sentences: why it is empty and what to do. */
  default?(): unknown;
  /** The next step, an `EButton`. */
  action?(): unknown;
}>();
</script>

<template>
  <div
    class="e-empty"
    :class="[bare && 'e-empty--bare', tone === 'danger' && 'e-empty--danger', size === 'sm' && 'e-empty--sm']"
  >
    <span v-if="icon" class="e-empty-icon"><EIcon :name="icon" :size="size === 'sm' ? 'md' : 'lg'" /></span>
    <component :is="`h${headingLevel}`" class="e-empty-title e-h e-h3">{{ title }}</component>
    <p v-if="$slots.default" class="e-empty-text"><slot /></p>
    <slot name="action" />
  </div>
</template>

<style>
@layer e.containers {
  .e-empty {
    display: grid;
    justify-items: center;
    gap: var(--e-gap-base);
    padding-block: calc(var(--e-pad-panel) + var(--e-gap-snug));
    padding-inline: var(--e-pad-card);
    outline: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    border-radius: var(--e-radius-md);
    text-align: center;
  }

  .e-empty--bare {
    outline: 0;
  }

  .e-empty--sm {
    padding-block: var(--e-pad-card);
  }

  .e-empty-icon {
    display: grid;
    place-items: center;
    color: var(--e-primary);
  }

  .e-empty--danger .e-empty-icon {
    color: var(--e-danger);
  }

  .e-empty-text {
    margin: 0;
    max-width: 38ch;
    font: var(--e-type-body);
    color: var(--e-muted);
  }

  @media (forced-colors: active) {
    .e-empty {
      outline-color: CanvasText;
    }

    .e-empty-icon {
      color: CanvasText;
    }
  }
}
</style>
