<script setup lang="ts">
import "../../styles/base.css";

defineProps<{
  /** Renders a `code` element in the mono font, for a name, value or snippet inside a sentence. Without it the element is a `mark`, for a word worth noticing. */
  code?: boolean;
}>();

defineSlots<{
  /** The text to mark. */
  default(): unknown;
}>();
</script>

<template>
  <code v-if="code" class="e-highlight e-highlight--code"><slot /></code>
  <mark v-else class="e-highlight"><slot /></mark>
</template>

<style>
@layer e.primitives {
  .e-highlight {
    padding: 0.1em 0.35em;
    border-radius: 0.25em;
    background: linear-gradient(
      to bottom,
      transparent 4%,
      color-mix(in srgb, var(--e-secondary) 38%, transparent) 4% 100%,
      transparent 100%
    );
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
    color: var(--e-ink);
    font-weight: 500;
  }

  /* Inside a link the highlight gives way to the link: no wash, an underline instead. */
  a:any-link > .e-highlight {
    padding: 0;
    background: transparent;
    color: inherit;
    text-decoration: underline;
    text-decoration-thickness: var(--e-stroke-edge);
    text-decoration-color: currentcolor;
    text-underline-offset: var(--e-space-1);
  }

  .e-highlight--code {
    font-family: var(--e-font-mono);
    font-size: var(--e-text-sm);
  }

  @media (forced-colors: active) {
    .e-highlight {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }
}
</style>
