<script lang="ts">
export type TagTone = "neutral" | "info" | "success" | "warning" | "danger";
</script>

<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";
import { useMessages } from "../../config.js";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** The text of the tag. It also names the Remove button, as "Remove Cardiology". */
    label: string;
    /** `neutral` has no colour. The others tint the tag with the tone of a Notice. */
    tone?: TagTone;
    /** `sm` is shorter, for a dense list. */
    size?: "sm" | "md";
    /** A decorative icon before the text. */
    icon?: IconProp;
    /** Adds a Remove button that emits `remove`. The tag does not remove itself. */
    removable?: boolean;
  }>(),
  { tone: "neutral", size: "md" },
);

const emit = defineEmits<{
  /** The Remove button was pressed, or Delete or Backspace was pressed on it. */
  remove: [];
}>();

defineSlots<{
  /** The content, instead of `label`, for text with a different style. `label` still names the Remove button. */
  default?(): unknown;
}>();

const t = useMessages();
</script>

<template>
  <span class="e-tag" :class="[tone !== 'neutral' && `e-tag--${tone}`, size === 'sm' && 'e-tag--sm']">
    <EIcon v-if="icon" :name="icon" size="sm" />
    <span class="e-tag-text"
      ><slot>{{ label }}</slot></span
    >
    <button
      v-if="removable"
      type="button"
      class="e-tag-remove e-interact"
      :aria-label="t('removeItem', { label })"
      @click="emit('remove')"
      @keydown.delete.prevent="emit('remove')"
    >
      <EIcon name="x" size="sm" />
    </button>
  </span>
</template>

<style>
@layer e.primitives {
  .e-tag {
    --_ink: var(--e-ink);
    --_edge: var(--e-border-strong);
    --_bg: var(--e-surface-tint);

    display: inline-flex;
    align-items: center;
    gap: var(--e-gap-tight);
    max-inline-size: 100%;
    min-block-size: calc(var(--e-chip-height) + var(--e-gap-tight));
    padding-inline: calc(var(--e-pad-chip) - var(--e-stroke-hair));
    border: var(--e-stroke-hair) solid var(--_edge);
    border-radius: var(--e-radius-pill);
    background: var(--_bg);
    color: var(--_ink);
    font: var(--e-weight-medium) var(--e-text-sm) / var(--e-leading-tight) var(--e-font-sans);
  }

  .e-tag--sm {
    min-block-size: var(--e-chip-height);
  }

  .e-tag--info {
    --_ink: var(--e-info);
    --_edge: var(--e-info);
    --_bg: var(--e-primary-soft);
  }

  .e-tag--success {
    --_ink: var(--e-success);
    --_edge: var(--e-success);
    --_bg: var(--e-success-soft);
  }

  .e-tag--warning {
    --_ink: var(--e-warning);
    --_edge: var(--e-warning);
    --_bg: var(--e-warning-soft);
  }

  .e-tag--danger {
    --_ink: var(--e-danger);
    --_edge: var(--e-danger);
    --_bg: var(--e-danger-soft);
  }

  .e-tag-text {
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* A 24px button, with a hit area that reaches past it. A tag has `pad-chip` of room beside it, so the button sits at the end with the padding trimmed. */
  .e-tag-remove {
    position: relative;
    display: grid;
    flex: none;
    place-items: center;
    inline-size: var(--e-chip-height);
    block-size: var(--e-chip-height);
    margin-inline-end: calc(-1 * var(--e-gap-tight));
    padding: 0;
    border: 0;
    border-radius: var(--e-radius-round);
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .e-tag-remove::after {
    content: "";
    position: absolute;
    inset: calc(-1 * var(--e-gap-tight));
  }

  @media (forced-colors: active) {
    .e-tag {
      border-color: CanvasText;
    }
  }
}
</style>
