<script setup lang="ts">
import "../../styles/base.css";

defineProps<{
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
  <!-- The text and the swatch touch the tags: any whitespace would show as a space in the sentence. -->
  <!-- eslint-disable vue/multiline-html-element-content-newline -->
  <component :is="code ? 'code' : 'mark'" class="e-highlight" :class="code && 'e-highlight--code'"
    ><slot /><span v-if="swatch" class="e-highlight-swatch" :style="{ '--_swatch': swatch }" aria-hidden="true"
  /></component>
  <!-- eslint-enable vue/multiline-html-element-content-newline -->
</template>

<style>
@layer e.primitives {
  /* The accent text colour, a little heavier, on a faint tint of the same colour. The tint is only paint behind the letters: no padding, border or margin, so the text takes the same room as plain text. */
  .e-highlight {
    background: color-mix(in srgb, var(--e-secondary) 12%, transparent);
    box-decoration-break: clone;

    /* A little ink in the text, so it holds 4.5:1 on its own pill over a tinted ground (a striped row), where the pill is deeper than on the surface. */
    color: color-mix(in srgb, var(--e-secondary) 88%, var(--e-ink));
    font-weight: var(--e-weight-strong);
  }

  /* Inside a link the highlight gives way to the link: its colour, an underline, no tint. */
  a:any-link > .e-highlight {
    background: transparent;
    color: inherit;
    text-decoration: underline;
    text-decoration-thickness: var(--e-stroke-edge);
    text-decoration-color: currentcolor;
    text-underline-offset: var(--e-underline-offset);
  }

  /* The square sits on the text's baseline, a little smaller than the letters, with a faint edge so a pale colour is still seen on a pale page. */
  .e-highlight-swatch {
    display: inline-block;
    width: var(--e-text-sm);
    height: var(--e-text-sm);
    margin-inline-start: var(--e-gap-tight);
    border-radius: var(--e-radius-sm);
    box-sizing: border-box;
    border: var(--e-stroke-hair) solid var(--e-wash-ring);
    background: var(--_swatch);
    background-clip: padding-box;
    vertical-align: -0.08em;
  }

  .e-highlight--code {
    font-family: var(--e-font-mono);
    font-size: var(--e-text-sm);
  }

  @media (forced-colors: active) {
    .e-highlight {
      background: Mark;
      color: MarkText;
    }

    .e-highlight--code {
      background: transparent;
      color: CanvasText;
    }

    .e-highlight-swatch {
      forced-color-adjust: none;
      outline: var(--e-stroke-hair) solid CanvasText;
    }
  }
}
</style>
