<script setup lang="ts">
import { computed } from "vue";
import type { ElementTag, Size, Tone } from "../../composables/useSize.js";
import "../../styles/base.css";

/** The colour of the text. */
export type TextTone = Extract<Tone, "neutral" | "info" | "success" | "warning" | "danger">;

const props = withDefaults(
  defineProps<{
    /** `sm` for captions and fine print, `lg` for the one-sentence reading of a statement. `textScale` rescales both. */
    size?: Extract<Size, "sm" | "md" | "lg">;
    /** The colour of the text. Left out, it is the ink colour. `neutral` is the quieter colour of secondary copy. */
    tone?: TextTone;
    /** Aligns the lines. `start` and `end` follow the writing direction. */
    align?: "start" | "center" | "end";
    /** The weight, instead of the regular one. */
    weight?: "medium" | "strong";
    /** Sets the text in the mono font, for codes and amounts. */
    mono?: boolean;
    /** Keeps the text to one line and ends it with an ellipsis where it does not fit. Give the element a width to cut it to. */
    truncate?: boolean;
    /** Cuts the text after this many lines with an ellipsis. */
    lines?: number;
    /** Caps the line at the reading measure (`--e-measure`). `false` lets it fill its cell, as in a flex or grid layout. */
    measure?: boolean;
    /** The element to render. */
    as?: ElementTag;
  }>(),
  { size: "md", as: "p", measure: true },
);

defineSlots<{
  /** The text. */
  default(): unknown;
}>();

/** Each tone's colour token. `neutral` is the muted ink. */
const toneVar = (t: string) => `var(--e-${t === "neutral" ? "muted" : t})`;
const style = computed(() => ({
  "--_tone": props.tone && toneVar(props.tone),
  "--_measure": props.measure ? undefined : "none",
  "--_lines": props.lines,
  textAlign: props.align,
  fontWeight: props.weight && `var(--e-weight-${props.weight})`,
}));
</script>

<template>
  <component
    :is="as"
    class="e-text"
    :class="[
      size === 'sm' && 'e-text--small',
      size === 'lg' && 'e-text--large',
      tone === 'neutral' && 'e-text--muted',
      mono && 'e-text--mono',
      truncate && 'e-text--truncate',
      lines && 'e-text--clamp',
    ]"
    :style="style"
  >
    <slot />
  </component>
</template>

<style>
@layer e.primitives {
  .e-text {
    margin: 0;
    max-width: var(--_measure, var(--e-measure));
    font: var(--e-type-body);
    color: var(--_tone, var(--e-ink));
    text-wrap: pretty;
  }

  .e-text--large {
    font: var(--e-type-deck);
  }

  .e-text--small {
    font: var(--e-type-small);
  }

  .e-text--mono {
    font-family: var(--e-font-mono);
  }

  .e-text--truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .e-text--clamp {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--_lines);
  }
}
</style>
