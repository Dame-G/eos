<script setup lang="ts">
import "../../styles/base.css";

const props = defineProps<{
  /** Renders a `code` element in the mono font, for a name, value or snippet inside a sentence. Without it the element is a `mark`, for a word worth noticing. */
  code?: boolean;
  /** A CSS colour drawn as a square after the text, for a colour value such as `#2c95b4`. The square is decoration, so put the value itself in the text. */
  swatch?: string;
}>();

defineSlots<{
  /** The text to mark. */
  default(): unknown;
}>();
</script>

<template>
  <code v-if="code" class="e-highlight e-highlight--code"
    ><slot /><span
      v-if="props.swatch"
      class="e-highlight-swatch"
      :style="{ '--e-swatch': props.swatch }"
      aria-hidden="true"
  /></code>
  <mark v-else class="e-highlight"
    ><slot /><span
      v-if="props.swatch"
      class="e-highlight-swatch"
      :style="{ '--e-swatch': props.swatch }"
      aria-hidden="true"
  /></mark>
</template>

<style>
@layer e.primitives {
  /* The accent text colour, a little heavier, on a faint tint of the same colour. The tint is only paint behind the letters: no padding, border or margin, so the text takes the same room as plain text. */
  .e-highlight {
    background: color-mix(in srgb, var(--e-secondary) 12%, transparent);
    box-decoration-break: clone;
    color: var(--e-secondary);
    font-weight: 600;
  }

  /* Inside a link the highlight gives way to the link: its colour, an underline, no tint. */
  a:any-link > .e-highlight {
    background: transparent;
    color: inherit;
    text-decoration: underline;
    text-decoration-thickness: var(--e-stroke-edge);
    text-decoration-color: currentcolor;
    text-underline-offset: var(--e-space-1);
  }

  /* The square sits on the text's baseline, a little smaller than the letters, with a faint edge so a pale colour is still seen on a pale page. */
  .e-highlight-swatch {
    display: inline-block;
    width: 0.85em;
    height: 0.85em;
    margin-inline-start: 0.4em;
    border-radius: 0.2em;
    box-sizing: border-box;
    border: var(--e-stroke-hair) solid color-mix(in srgb, var(--e-ink) 30%, transparent);
    background: var(--e-swatch);
    background-clip: padding-box;
    vertical-align: -0.08em;
  }

  .e-highlight--code {
    font-family: var(--e-font-mono);
    font-size: var(--e-text-sm);
  }

  @media (forced-colors: active) {
    .e-highlight {
      forced-color-adjust: none;
      background: transparent;
      color: Highlight;
    }

    .e-highlight-swatch {
      forced-color-adjust: none;
      outline: var(--e-stroke-hair) solid CanvasText;
    }
  }
}
</style>
